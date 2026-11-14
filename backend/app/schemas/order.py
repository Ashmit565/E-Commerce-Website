from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class OrderItemOut(BaseModel):
    id: int
    order_id: int
    product_id: Optional[int]
    product_name: str
    product_image: str
    price: Decimal
    original_price: Decimal
    quantity: int
    total_price: Decimal
    created_at: datetime

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    address_id: int
    payment_method: str = Field(..., description="card, upi, cod, simulated")

class OrderCancelRequest(BaseModel):
    reason: Optional[str] = "Customer requested cancellation"

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="Pending, Confirmed, Processing, Shipped, Delivered, Cancelled")

class OrderOut(BaseModel):
    id: int
    order_number: str
    user_id: int
    address_id: Optional[int]
    status: str
    subtotal: Decimal
    discount_amount: Decimal
    delivery_charge: Decimal
    total_amount: Decimal
    payment_method: str
    payment_status: str
    shipping_address_snapshot: str
    cancel_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

class PaginatedOrders(BaseModel):
    items: List[OrderOut]
    total: int
    page: int
    limit: int
    pages: int

