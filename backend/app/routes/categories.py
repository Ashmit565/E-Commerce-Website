from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.category import CategoryOut, CategoryCreate, CategoryUpdate
from app.services.product_service import ProductService
from app.dependencies.permissions import get_current_admin_user

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    categories = ProductService.list_categories(db)
    # calculate product_count
    results = []
    for cat in categories:
        cat_dict = {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "image_url": cat.image_url,
            "is_active": cat.is_active,
            "product_count": len([p for p in cat.products if p.is_active]),
            "created_at": cat.created_at,
            "updated_at": cat.updated_at
        }
        results.append(cat_dict)
    return results

@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = ProductService.get_category(db, category_id)
    return {
        "id": cat.id,
        "name": cat.name,
        "slug": cat.slug,
        "description": cat.description,
        "image_url": cat.image_url,
        "is_active": cat.is_active,
        "product_count": len([p for p in cat.products if p.is_active]),
        "created_at": cat.created_at,
        "updated_at": cat.updated_at
    }

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    cat = ProductService.create_category(db, cat_in)
    return {
        "id": cat.id,
        "name": cat.name,
        "slug": cat.slug,
        "description": cat.description,
        "image_url": cat.image_url,
        "is_active": cat.is_active,
        "product_count": 0,
        "created_at": cat.created_at,
        "updated_at": cat.updated_at
    }

@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    cat_in: CategoryUpdate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    cat = ProductService.update_category(db, category_id, cat_in)
    return {
        "id": cat.id,
        "name": cat.name,
        "slug": cat.slug,
        "description": cat.description,
        "image_url": cat.image_url,
        "is_active": cat.is_active,
        "product_count": len([p for p in cat.products if p.is_active]),
        "created_at": cat.created_at,
        "updated_at": cat.updated_at
    }

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    ProductService.delete_category(db, category_id)
    return {"message": "Category deleted successfully"}

