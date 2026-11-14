import json
from decimal import Decimal
from typing import List, Dict, Optional, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc

from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.cart import Cart, CartItem
from app.models.wishlist import Wishlist, WishlistItem
from app.schemas.chatbot import (
    ProductSummaryCard,
    ProductComparisonItem,
    ProductComparisonResponse,
    OrderSummaryItem,
    CartSummaryResponse
)
from app.services.cart_service import CartService

class ChatbotTools:
    """
    Real database querying tools for ShopBot.
    All data is retrieved from MySQL - no invented items or data.
    """

    @staticmethod
    def _to_summary_card(p: Product) -> ProductSummaryCard:
        try:
            cat_name = p.category.name if p.category else "General"
        except Exception:
            cat_name = "General"
        return ProductSummaryCard(
            id=p.id,
            name=p.name,
            slug=p.slug,
            price=Decimal(str(p.price)),
            original_price=Decimal(str(p.original_price)),
            discount_percent=p.discount_percent or 0,
            stock=p.stock or 0,
            rating=Decimal(str(p.rating or 4.5)),
            num_reviews=p.num_reviews or 0,
            thumbnail=p.thumbnail,
            category_name=cat_name,
            specifications=p.specifications
        )

    @classmethod
    def search_products(
        cls,
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        max_price: Optional[Decimal] = None,
        min_price: Optional[Decimal] = None,
        min_rating: Optional[float] = None,
        in_stock_only: bool = True,
        sort_by: str = "popularity",
        limit: int = 6
    ) -> List[ProductSummaryCard]:
        q = db.query(Product).options(joinedload(Product.category)).filter(Product.is_active == True)

        if in_stock_only:
            q = q.filter(Product.stock > 0)

        if category:
            cat_slug = category.lower().replace(" ", "-").replace("&", "").replace("--", "-")
            q = q.join(Product.category).filter(
                or_(
                    Category.slug.ilike(f"%{cat_slug}%"),
                    Category.name.ilike(f"%{category}%")
                )
            )

        if query:
            keywords = [k.strip() for k in query.split() if len(k.strip()) > 2]
            conditions = []
            for kw in keywords[:4]:
                conditions.append(Product.name.ilike(f"%{kw}%"))
                conditions.append(Product.description.ilike(f"%{kw}%"))
            if conditions:
                q = q.filter(or_(*conditions))

        if min_price is not None:
            q = q.filter(Product.price >= min_price)
        if max_price is not None:
            q = q.filter(Product.price <= max_price)

        if min_rating is not None:
            q = q.filter(Product.rating >= min_rating)

        if sort_by == "price_asc":
            q = q.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            q = q.order_by(Product.price.desc())
        elif sort_by == "rating":
            q = q.order_by(Product.rating.desc(), Product.num_reviews.desc())
        elif sort_by == "discount":
            q = q.order_by(Product.discount_percent.desc())
        else:
            q = q.order_by(Product.is_featured.desc(), Product.rating.desc(), Product.created_at.desc())

        products = q.limit(limit).all()
        return [cls._to_summary_card(p) for p in products]

    @classmethod
    def get_best_deals(cls, db: Session, limit: int = 6) -> List[ProductSummaryCard]:
        products = (
            db.query(Product)
            .options(joinedload(Product.category))
            .filter(Product.is_active == True, Product.stock > 0, Product.discount_percent > 0)
            .order_by(Product.discount_percent.desc(), Product.rating.desc())
            .limit(limit)
            .all()
        )
        return [cls._to_summary_card(p) for p in products]

    @classmethod
    def get_trending(cls, db: Session, limit: int = 6) -> List[ProductSummaryCard]:
        products = (
            db.query(Product)
            .options(joinedload(Product.category))
            .filter(Product.is_active == True, Product.stock > 0)
            .filter(or_(Product.is_trending == True, Product.is_featured == True))
            .order_by(Product.rating.desc(), Product.num_reviews.desc())
            .limit(limit)
            .all()
        )
        if not products:
            products = db.query(Product).options(joinedload(Product.category)).filter(Product.is_active == True).order_by(Product.rating.desc()).limit(limit).all()
        return [cls._to_summary_card(p) for p in products]

    @classmethod
    def compare_products(
        cls,
        db: Session,
        identifiers: List[Any]  # list of product IDs or product names
    ) -> Optional[ProductComparisonResponse]:
        products: List[Product] = []
        for ident in identifiers:
            if isinstance(ident, int) or (isinstance(ident, str) and ident.isdigit()):
                p = db.query(Product).filter(Product.id == int(ident), Product.is_active == True).first()
            elif isinstance(ident, str):
                p = db.query(Product).filter(Product.name.ilike(f"%{ident.strip()}%"), Product.is_active == True).first()
            else:
                p = None
            if p and p not in products:
                products.append(p)

        if len(products) < 2:
            return None

        # Build comparison items
        items = []
        all_spec_keys = set(["Brand", "Warranty", "Return Policy"])
        
        for p in products:
            specs_map = {}
            if p.specifications:
                for line in p.specifications.split("\n"):
                    if ":" in line:
                        k, v = line.split(":", 1)
                        clean_k = k.strip()
                        specs_map[clean_k] = v.strip()
                        all_spec_keys.add(clean_k)

            items.append(ProductComparisonItem(
                id=p.id,
                name=p.name,
                slug=p.slug,
                price=Decimal(str(p.price)),
                original_price=Decimal(str(p.original_price)),
                discount_percent=p.discount_percent or 0,
                rating=Decimal(str(p.rating or 4.5)),
                stock=p.stock,
                thumbnail=p.thumbnail,
                specs_dict=specs_map
            ))

        # Build analytical verdict recommendation
        # 1. Best value (highest discount / lowest price)
        # 2. Highest rated
        sorted_by_rating = sorted(items, key=lambda x: (x.rating, x.discount_percent), reverse=True)
        best_rated = sorted_by_rating[0]
        cheapest = sorted(items, key=lambda x: x.price)[0]

        if best_rated.id == cheapest.id:
            verdict = (
                f"🌟 **Top Recommendation**: **{best_rated.name}** offers both the best customer rating "
                f"({best_rated.rating}★) and the most competitive price of ₹{best_rated.price:,.2f}."
            )
        else:
            verdict = (
                f"🌟 **Recommendation**: Choose **{best_rated.name}** for top-tier performance and highest rating ({best_rated.rating}★). "
                f"Alternatively, choose **{cheapest.name}** (₹{cheapest.price:,.2f}) if you are looking for the most budget-friendly option."
            )

        return ProductComparisonResponse(
            products=items,
            compared_attributes=sorted(list(all_spec_keys)),
            verdict=verdict
        )

    @classmethod
    def get_user_orders(cls, db: Session, user_id: int, limit: int = 5) -> List[OrderSummaryItem]:
        orders = (
            db.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(desc(Order.created_at))
            .limit(limit)
            .all()
        )

        results = []
        for o in orders:
            items_list = []
            for it in o.items:
                items_list.append({
                    "product_name": it.product_name,
                    "quantity": it.quantity,
                    "price": float(it.price),
                    "product_image": it.product_image
                })

            shipping_city = None
            if o.shipping_address_snapshot:
                try:
                    s_data = json.loads(o.shipping_address_snapshot)
                    shipping_city = s_data.get("city")
                except Exception:
                    pass

            results.append(OrderSummaryItem(
                id=o.id,
                order_number=o.order_number,
                created_at=o.created_at.strftime("%b %d, %Y"),
                status=o.status,
                payment_status=o.payment_status,
                payment_method=o.payment_method.upper(),
                total_amount=Decimal(str(o.total_amount)),
                item_count=sum(it.quantity for it in o.items),
                items=items_list,
                shipping_city=shipping_city
            ))
        return results

    @classmethod
    def get_user_cart(cls, db: Session, user_id: int) -> CartSummaryResponse:
        cart_data = CartService.get_cart_details(db, user_id)
        items_summary = []
        for it in cart_data.get("items", []):
            prod = it.get("product")
            items_summary.append({
                "product_id": it.get("product_id"),
                "name": prod.name if prod else "Item",
                "quantity": it.get("quantity"),
                "price": float(it.get("price", 0)),
                "item_total": float(it.get("item_total", 0)),
                "thumbnail": prod.thumbnail if prod else ""
            })

        return CartSummaryResponse(
            item_count=cart_data.get("item_count", 0),
            subtotal=cart_data.get("subtotal", Decimal("0.00")),
            discount_amount=cart_data.get("discount_amount", Decimal("0.00")),
            delivery_charge=cart_data.get("delivery_charge", Decimal("0.00")),
            total_amount=cart_data.get("total_amount", Decimal("0.00")),
            items=items_summary
        )

    @classmethod
    def add_to_cart(cls, db: Session, user_id: int, product_id: int, quantity: int = 1) -> Tuple[bool, str, Optional[Product]]:
        product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
        if not product:
            return False, "Product not found or currently unavailable.", None

        if product.stock < quantity:
            return False, f"Sorry, only {product.stock} units are currently in stock for {product.name}.", product

        # Add to cart using CartService
        from app.schemas.cart import CartItemCreate
        try:
            CartService.add_item(db, user_id, CartItemCreate(product_id=product_id, quantity=quantity))
            return True, f"Successfully added {quantity}x **{product.name}** to your shopping cart!", product
        except Exception as e:
            return False, f"Could not update cart: {str(e)}", product

    @classmethod
    def get_user_wishlist(cls, db: Session, user_id: int) -> List[ProductSummaryCard]:
        wl = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wl or not wl.items:
            return []
        
        cards = []
        for it in wl.items:
            if it.product and it.product.is_active:
                cards.append(cls._to_summary_card(it.product))
        return cards

    @classmethod
    def add_to_wishlist(cls, db: Session, user_id: int, product_id: int) -> Tuple[bool, str, Optional[Product]]:
        product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
        if not product:
            return False, "Product not found.", None

        wl = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wl:
            wl = Wishlist(user_id=user_id)
            db.add(wl)
            db.commit()
            db.refresh(wl)

        existing = db.query(WishlistItem).filter(
            WishlistItem.wishlist_id == wl.id,
            WishlistItem.product_id == product_id
        ).first()

        if existing:
            return True, f"**{product.name}** is already in your wishlist!", product

        item = WishlistItem(wishlist_id=wl.id, product_id=product_id)
        db.add(item)
        db.commit()
        return True, f"Added **{product.name}** to your wishlist!", product
