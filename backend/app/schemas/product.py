from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class ProductImageBase(BaseModel):
    image_url: str
    is_primary: Optional[bool] = False

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageOut(ProductImageBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    category_id: Optional[int] = None
    description: str
    specifications: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    original_price: Decimal = Field(..., gt=0)
    discount_percent: Optional[int] = 0
    stock: int = Field(..., ge=0)
    is_featured: Optional[bool] = False
    is_trending: Optional[bool] = False
    is_active: Optional[bool] = True
    thumbnail: str

class ProductCreate(ProductBase):
    slug: Optional[str] = None
    images: Optional[List[str]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    specifications: Optional[str] = None
    price: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    discount_percent: Optional[int] = None
    stock: Optional[int] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    is_active: Optional[bool] = None
    thumbnail: Optional[str] = None
    images: Optional[List[str]] = None

class CategorySummary(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True

class ProductOut(ProductBase):
    id: int
    slug: str
    rating: Decimal
    num_reviews: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategorySummary] = None
    images: List[ProductImageOut] = []

    class Config:
        from_attributes = True

class PaginatedProducts(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    limit: int
    pages: int

