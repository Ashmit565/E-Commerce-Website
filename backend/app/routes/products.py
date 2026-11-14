from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.product import ProductOut, ProductCreate, ProductUpdate, PaginatedProducts
from app.services.product_service import ProductService
from app.dependencies.permissions import get_current_admin_user

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=PaginatedProducts)
def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    category: Optional[str] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    min_rating: Optional[float] = None,
    in_stock_only: Optional[bool] = False,
    is_featured: Optional[bool] = None,
    is_trending: Optional[bool] = None,
    sort_by: Optional[str] = "newest",
    db: Session = Depends(get_db)
):
    products, total, pages = ProductService.list_products(
        db=db,
        page=page,
        limit=limit,
        category_slug=category,
        category_id=category_id,
        search=search,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        in_stock_only=in_stock_only,
        is_featured=is_featured,
        is_trending=is_trending,
        sort_by=sort_by,
        is_active_only=True
    )
    return {
        "items": products,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return ProductService.get_product(db, product_id)

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return ProductService.create_product(db, product_in)

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return ProductService.update_product(db, product_id, product_in)

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: int,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    ProductService.delete_product(db, product_id)
    return {"message": "Product deleted successfully"}

