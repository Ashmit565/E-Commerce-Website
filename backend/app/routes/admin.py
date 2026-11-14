from typing import Optional, List
from decimal import Decimal
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderOut, OrderStatusUpdate, PaginatedOrders
from app.schemas.admin import DashboardStats, KPICards, CustomerListOut, SalesReportResponse
from app.schemas.user import UserOut
from app.repositories.order_repository import OrderRepository
from app.repositories.user_repository import UserRepository
from app.dependencies.permissions import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin_user)])

@router.get("/dashboard", response_model=DashboardStats)
def get_admin_dashboard(db: Session = Depends(get_db)):
    kpis = OrderRepository.get_dashboard_kpis(db)
    sales_overview = OrderRepository.get_sales_overview(db, days=14)
    cat_distribution = OrderRepository.get_category_distribution(db)
    order_status_distribution = OrderRepository.get_order_status_distribution(db)

    # Recent 5 orders
    recent_orders = db.query(Order).order_by(desc(Order.created_at)).limit(5).all()

    # Top selling products
    top_selling_subq = (
        db.query(OrderItem.product_id, func.sum(OrderItem.quantity).label("sold_qty"))
        .group_by(OrderItem.product_id)
        .order_by(desc("sold_qty"))
        .limit(5)
        .subquery()
    )
    top_products = (
        db.query(Product)
        .join(top_selling_subq, Product.id == top_selling_subq.c.product_id)
        .all()
    )

    # Fallback if no order items yet
    if not top_products:
        top_products = db.query(Product).order_by(desc(Product.rating)).limit(5).all()

    # Recent 5 customers
    recent_customers = (
        db.query(User)
        .filter(User.role == "customer")
        .order_by(desc(User.created_at))
        .limit(5)
        .all()
    )

    return {
        "kpi": KPICards(**kpis),
        "sales_overview": sales_overview,
        "category_distribution": cat_distribution,
        "order_status_distribution": order_status_distribution,
        "recent_orders": recent_orders,
        "top_selling_products": top_products,
        "recent_customers": recent_customers
    }

@router.get("/orders", response_model=PaginatedOrders)
def list_admin_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    orders, total = OrderRepository.list_all_orders(db, skip=skip, limit=limit, status=status, search=search)
    pages = (total + limit - 1) // limit if total > 0 else 1
    return {
        "items": orders,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

@router.put("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    order = OrderRepository.get_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # If cancelling, restore stock
    if status_in.status.capitalize() == "Cancelled" and order.status != "Cancelled":
        for item in order.items:
            if item.product_id:
                p = db.query(Product).filter(Product.id == item.product_id).first()
                if p:
                    p.stock += item.quantity

    return OrderRepository.update_status(db, order, status_in.status.capitalize())

@router.get("/customers", response_model=CustomerListOut)
def list_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    users, total = UserRepository.list_users(db, skip=skip, limit=limit, search=search, role="customer")
    pages = (total + limit - 1) // limit if total > 0 else 1
    return {
        "items": users,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

@router.put("/customers/{customer_id}/toggle-status")
def toggle_customer_status(customer_id: int, db: Session = Depends(get_db)):
    user = UserRepository.get_by_id(db, customer_id)
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return {"message": f"Customer {'activated' if user.is_active else 'deactivated'} successfully", "is_active": user.is_active}

@router.get("/reports/sales", response_model=SalesReportResponse)
def get_sales_reports(
    period: str = Query("monthly", pattern="^(daily|monthly)$"),
    db: Session = Depends(get_db)
):
    valid_statuses = ["Confirmed", "Processing", "Shipped", "Delivered"]
    
    if period == "daily":
        date_format = "%Y-%m-%d"
        start_date = datetime.utcnow() - timedelta(days=30)
    else:
        date_format = "%Y-%m"
        start_date = datetime.utcnow() - timedelta(days=365)

    orders = (
        db.query(Order)
        .filter(and_(Order.created_at >= start_date, Order.status.in_(valid_statuses)))
        .order_by(asc(Order.created_at))
        .all()
    )

    # Group by formatted string
    grouped = {}
    total_gross = Decimal("0.00")
    total_net = Decimal("0.00")
    total_disc = Decimal("0.00")

    for o in orders:
        key = o.created_at.strftime(date_format)
        if key not in grouped:
            grouped[key] = {
                "period": key,
                "orders_count": 0,
                "gross_sales": Decimal("0.00"),
                "net_sales": Decimal("0.00"),
                "discount_total": Decimal("0.00")
            }
        grouped[key]["orders_count"] += 1
        gross = o.subtotal + o.discount_amount
        grouped[key]["gross_sales"] += gross
        grouped[key]["net_sales"] += o.total_amount
        grouped[key]["discount_total"] += o.discount_amount

        total_gross += gross
        total_net += o.total_amount
        total_disc += o.discount_amount

    items = list(grouped.values())

    summary = {
        "total_orders": len(orders),
        "total_gross_sales": float(total_gross),
        "total_net_sales": float(total_net),
        "total_discounts": float(total_disc)
    }

    return {"summary": summary, "items": items}
