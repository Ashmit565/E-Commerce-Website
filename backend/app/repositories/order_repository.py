from typing import Optional, List, Tuple, Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, and_
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.product import Product
from app.models.category import Category

class OrderRepository:
    @staticmethod
    def get_by_id(db: Session, order_id: int) -> Optional[Order]:
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def get_by_order_number(db: Session, order_number: str) -> Optional[Order]:
        return db.query(Order).filter(Order.order_number == order_number).first()

    @staticmethod
    def list_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> Tuple[List[Order], int]:
        query = db.query(Order).filter(Order.user_id == user_id)
        total = query.count()
        orders = query.order_by(desc(Order.created_at)).offset(skip).limit(limit).all()
        return orders, total

    @staticmethod
    def list_all_orders(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[Order], int]:
        query = db.query(Order)
        if status:
            query = query.filter(Order.status == status)
        if search:
            search_term = f"%{search.strip()}%"
            query = query.join(Order.user).filter(
                (Order.order_number.ilike(search_term)) |
                (User.full_name.ilike(search_term)) |
                (User.email.ilike(search_term))
            )

        total = query.count()
        orders = query.order_by(desc(Order.created_at)).offset(skip).limit(limit).all()
        return orders, total

    @staticmethod
    def update_status(db: Session, order: Order, new_status: str, cancel_reason: Optional[str] = None) -> Order:
        order.status = new_status
        if cancel_reason:
            order.cancel_reason = cancel_reason
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_dashboard_kpis(db: Session) -> Dict[str, Any]:
        # Total Sales from confirmed/delivered/processing/shipped orders
        valid_statuses = ["Confirmed", "Processing", "Shipped", "Delivered"]
        sales_sum = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
            Order.status.in_(valid_statuses)
        ).scalar()

        total_orders = db.query(func.count(Order.id)).scalar()
        total_customers = db.query(func.count(User.id)).filter(User.role == "customer").scalar()
        total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
        pending_orders = db.query(func.count(Order.id)).filter(Order.status == "Pending").scalar()
        low_stock_products = db.query(func.count(Product.id)).filter(
            and_(Product.is_active == True, Product.stock <= 5)
        ).scalar()

        return {
            "total_sales": Decimal(str(sales_sum)),
            "total_orders": total_orders or 0,
            "total_customers": total_customers or 0,
            "total_products": total_products or 0,
            "pending_orders": pending_orders or 0,
            "low_stock_products": low_stock_products or 0
        }

    @staticmethod
    def get_sales_overview(db: Session, days: int = 7) -> List[Dict[str, Any]]:
        # Last N days daily sales
        start_date = datetime.utcnow() - timedelta(days=days)
        valid_statuses = ["Confirmed", "Processing", "Shipped", "Delivered"]
        
        results = (
            db.query(
                func.date(Order.created_at).label("order_date"),
                func.coalesce(func.sum(Order.total_amount), 0).label("daily_sales"),
                func.count(Order.id).label("daily_orders")
            )
            .filter(
                and_(
                    Order.created_at >= start_date,
                    Order.status.in_(valid_statuses)
                )
            )
            .group_by(func.date(Order.created_at))
            .order_by(asc("order_date"))
            .all()
        )

        # Build list formatted
        overview = []
        for r in results:
            overview.append({
                "date": str(r.order_date),
                "sales": Decimal(str(r.daily_sales)),
                "orders": int(r.daily_orders)
            })
            
        # Ensure at least today exists if overview is empty
        if not overview:
            overview.append({
                "date": datetime.utcnow().strftime("%Y-%m-%d"),
                "sales": Decimal("0.00"),
                "orders": 0
            })
        return overview

    @staticmethod
    def get_category_distribution(db: Session) -> List[Dict[str, Any]]:
        # Sales per category
        valid_statuses = ["Confirmed", "Processing", "Shipped", "Delivered"]
        results = (
            db.query(
                Category.name,
                func.coalesce(func.sum(OrderItem.total_price), 0).label("cat_sales"),
                func.count(OrderItem.id).label("item_count")
            )
            .join(Product, Product.id == OrderItem.product_id)
            .join(Category, Category.id == Product.category_id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(Order.status.in_(valid_statuses))
            .group_by(Category.name)
            .order_by(desc("cat_sales"))
            .limit(6)
            .all()
        )

        return [
            {
                "category_name": r[0],
                "sales": Decimal(str(r[1])),
                "count": int(r[2])
            }
            for r in results
        ]

    @staticmethod
    def get_order_status_distribution(db: Session) -> List[Dict[str, Any]]:
        results = (
            db.query(Order.status, func.count(Order.id))
            .group_by(Order.status)
            .all()
        )
        return [{"status": r[0], "count": int(r[1])} for r in results]

