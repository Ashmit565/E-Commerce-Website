from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.product import ProductOut

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, gt=0)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItemOut(BaseModel):
    id: int
    cart_id: int
    product_id: int
    quantity: int
    product: ProductOut
    item_total: Decimal
    item_original_total: Decimal
    item_discount: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CartOut(BaseModel):
    id: int
    user_id: int
    items: List[CartItemOut] = []
    item_count: int = 0
    subtotal: Decimal = Decimal("0.00")
    original_total: Decimal = Decimal("0.00")
    discount_amount: Decimal = Decimal("0.00")
    delivery_charge: Decimal = Decimal("0.00")
    total_amount: Decimal = Decimal("0.00")

    class Config:
        from_attributes = True

