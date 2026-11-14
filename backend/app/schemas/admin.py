from typing import List, Dict, Any, Optional
from decimal import Decimal
from pydantic import BaseModel
from app.schemas.order import OrderOut
from app.schemas.product import ProductOut
from app.schemas.user import UserOut

class KPICards(BaseModel):
    total_sales: Decimal
    total_orders: int
    total_customers: int
    total_products: int
    pending_orders: int
    low_stock_products: int

class SalesChartPoint(BaseModel):
    date: str
    sales: Decimal
    orders: int

class CategorySalesPoint(BaseModel):
    category_name: str
    sales: Decimal
    count: int

class OrderStatusDistribution(BaseModel):
    status: str
    count: int

class DashboardStats(BaseModel):
    kpi: KPICards
    sales_overview: List[SalesChartPoint]
    category_distribution: List[CategorySalesPoint]
    order_status_distribution: List[OrderStatusDistribution]
    recent_orders: List[OrderOut]
    top_selling_products: List[ProductOut]
    recent_customers: List[UserOut]

class CustomerListOut(BaseModel):
    items: List[UserOut]
    total: int
    page: int
    limit: int
    pages: int

class SalesReportItem(BaseModel):
    period: str
    orders_count: int
    gross_sales: Decimal
    net_sales: Decimal
    discount_total: Decimal

class SalesReportResponse(BaseModel):
    summary: Dict[str, Any]
    items: List[SalesReportItem]

