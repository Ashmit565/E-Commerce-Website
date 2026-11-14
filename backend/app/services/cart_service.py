from typing import Dict, Any
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate

# Business rule for delivery charge
# E.g. Free delivery for subtotal >= 500, otherwise 50
FREE_DELIVERY_THRESHOLD = Decimal("500.00")
STANDARD_DELIVERY_FEE = Decimal("50.00")

class CartService:
    @staticmethod
    def get_or_create_cart(db: Session, user_id: int) -> Cart:
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    @staticmethod
    def get_cart_details(db: Session, user_id: int) -> Dict[str, Any]:
        cart = CartService.get_or_create_cart(db, user_id)
        
        items = []
        item_count = 0
        subtotal = Decimal("0.00")
        original_total = Decimal("0.00")

        # Refresh and calculate each item against current DB product state
        for item in cart.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product or not product.is_active:
                continue

            # Check if quantity exceeds current stock
            adjusted_qty = item.quantity
            if product.stock < adjusted_qty:
                adjusted_qty = max(0, product.stock)
                item.quantity = adjusted_qty
                db.commit()

            if adjusted_qty == 0:
                continue

            price = Decimal(str(product.price))
            orig_price = Decimal(str(product.original_price))
            item_total = price * adjusted_qty
            item_orig_total = orig_price * adjusted_qty
            item_disc = item_orig_total - item_total

            subtotal += item_total
            original_total += item_orig_total
            item_count += adjusted_qty

            items.append({
                "id": item.id,
                "cart_id": cart.id,
                "product_id": product.id,
                "quantity": adjusted_qty,
                "product": product,
                "item_total": item_total,
                "item_original_total": item_orig_total,
                "item_discount": item_disc,
                "created_at": item.created_at,
                "updated_at": item.updated_at
            })

        discount_amount = original_total - subtotal
        if discount_amount < Decimal("0.00"):
            discount_amount = Decimal("0.00")

        delivery_charge = Decimal("0.00")
        if item_count > 0:
            delivery_charge = Decimal("0.00") if subtotal >= FREE_DELIVERY_THRESHOLD else STANDARD_DELIVERY_FEE

        total_amount = subtotal + delivery_charge

        return {
            "id": cart.id,
            "user_id": user_id,
            "items": items,
            "item_count": item_count,
            "subtotal": subtotal,
            "original_total": original_total,
            "discount_amount": discount_amount,
            "delivery_charge": delivery_charge,
            "total_amount": total_amount
        }

    @staticmethod
    def add_item(db: Session, user_id: int, item_in: CartItemCreate) -> Dict[str, Any]:
        cart = CartService.get_or_create_cart(db, user_id)
        product = db.query(Product).filter(Product.id == item_in.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail="Product not found or unavailable")

        if product.stock <= 0:
            raise HTTPException(status_code=400, detail="Product is currently out of stock")

        cart_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item_in.product_id
        ).first()

        new_qty = item_in.quantity
        if cart_item:
            new_qty += cart_item.quantity

        if new_qty > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot add {item_in.quantity} items. Only {product.stock} in stock (currently {cart_item.quantity if cart_item else 0} in cart)."
            )

        if cart_item:
            cart_item.quantity = new_qty
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product.id,
                quantity=item_in.quantity
            )
            db.add(cart_item)

        db.commit()
        return CartService.get_cart_details(db, user_id)

    @staticmethod
    def update_item_quantity(db: Session, user_id: int, item_id: int, item_in: CartItemUpdate) -> Dict[str, Any]:
        cart = CartService.get_or_create_cart(db, user_id)
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        ).first()

        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product or not product.is_active:
            db.delete(cart_item)
            db.commit()
            raise HTTPException(status_code=400, detail="Product is no longer available")

        if item_in.quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Requested quantity exceeds available stock of {product.stock}"
            )

        if item_in.quantity <= 0:
            db.delete(cart_item)
        else:
            cart_item.quantity = item_in.quantity

        db.commit()
        return CartService.get_cart_details(db, user_id)

    @staticmethod
    def remove_item(db: Session, user_id: int, item_id: int) -> Dict[str, Any]:
        cart = CartService.get_or_create_cart(db, user_id)
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        ).first()

        if cart_item:
            db.delete(cart_item)
            db.commit()

        return CartService.get_cart_details(db, user_id)

    @staticmethod
    def clear_cart(db: Session, user_id: int) -> None:
        cart = CartService.get_or_create_cart(db, user_id)
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()

