from datetime import datetime
from typing import List
from pydantic import BaseModel
from app.schemas.product import ProductOut

class WishlistItemCreate(BaseModel):
    product_id: int

class WishlistItemOut(BaseModel):
    id: int
    wishlist_id: int
    product_id: int
    product: ProductOut
    created_at: datetime

    class Config:
        from_attributes = True

class WishlistOut(BaseModel):
    id: int
    user_id: int
    items: List[WishlistItemOut] = []
    item_count: int = 0

    class Config:
        from_attributes = True

