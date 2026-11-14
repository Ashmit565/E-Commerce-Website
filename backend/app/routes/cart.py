from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.cart import CartOut, CartItemCreate, CartItemUpdate
from app.services.cart_service import CartService
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("", response_model=CartOut)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return CartService.get_cart_details(db, current_user.id)

@router.post("/items", response_model=CartOut)
def add_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return CartService.add_item(db, current_user.id, item_in)

@router.put("/items/{item_id}", response_model=CartOut)
def update_cart_item(
    item_id: int,
    item_in: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return CartService.update_item_quantity(db, current_user.id, item_id, item_in)

@router.delete("/items/{item_id}", response_model=CartOut)
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return CartService.remove_item(db, current_user.id, item_id)

@router.delete("", status_code=status.HTTP_200_OK)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    CartService.clear_cart(db, current_user.id)
    return {"message": "Cart cleared successfully"}

