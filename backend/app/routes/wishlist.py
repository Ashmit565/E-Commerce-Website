from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.wishlist import Wishlist, WishlistItem
from app.models.product import Product
from app.schemas.wishlist import WishlistOut, WishlistItemCreate
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

def get_or_create_wishlist(db: Session, user_id: int) -> Wishlist:
    wl = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
    if not wl:
        wl = Wishlist(user_id=user_id)
        db.add(wl)
        db.commit()
        db.refresh(wl)
    return wl

@router.get("", response_model=WishlistOut)
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wl = get_or_create_wishlist(db, current_user.id)
    items = [item for item in wl.items if item.product and item.product.is_active]
    return {
        "id": wl.id,
        "user_id": current_user.id,
        "items": items,
        "item_count": len(items)
    }

@router.post("/items", response_model=WishlistOut)
def add_to_wishlist(
    item_in: WishlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")

    wl = get_or_create_wishlist(db, current_user.id)
    existing = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wl.id,
        WishlistItem.product_id == item_in.product_id
    ).first()

    if not existing:
        item = WishlistItem(wishlist_id=wl.id, product_id=product.id)
        db.add(item)
        db.commit()

    db.refresh(wl)
    items = [item for item in wl.items if item.product and item.product.is_active]
    return {
        "id": wl.id,
        "user_id": current_user.id,
        "items": items,
        "item_count": len(items)
    }

@router.delete("/items/{product_id}", response_model=WishlistOut)
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wl = get_or_create_wishlist(db, current_user.id)
    db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wl.id,
        WishlistItem.product_id == product_id
    ).delete()
    db.commit()
    db.refresh(wl)

    items = [item for item in wl.items if item.product and item.product.is_active]
    return {
        "id": wl.id,
        "user_id": current_user.id,
        "items": items,
        "item_count": len(items)
    }

