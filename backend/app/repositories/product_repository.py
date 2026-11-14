from typing import Optional, List, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from app.models.product import Product, ProductImage
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate
from app.utils.validators import slugify

class ProductRepository:
    @staticmethod
    def get_by_id(db: Session, product_id: int) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_by_slug(db: Session, slug: str) -> Optional[Product]:
        return db.query(Product).filter(Product.slug == slug).first()

    @staticmethod
    def list_products(
        db: Session,
        skip: int = 0,
        limit: int = 12,
        category_slug: Optional[str] = None,
        category_id: Optional[int] = None,
        search: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        min_rating: Optional[float] = None,
        in_stock_only: Optional[bool] = False,
        is_featured: Optional[bool] = None,
        is_trending: Optional[bool] = None,
        sort_by: Optional[str] = "newest",  # "price_asc", "price_desc", "rating", "popularity", "newest"
        is_active_only: bool = True
    ) -> Tuple[List[Product], int]:
        query = db.query(Product)
        
        if is_active_only:
            query = query.filter(Product.is_active == True)
            
        if category_slug:
            query = query.join(Product.category).filter(Category.slug == category_slug)
        elif category_id:
            query = query.filter(Product.category_id == category_id)

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                (Product.name.ilike(search_term)) |
                (Product.description.ilike(search_term))
            )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        if min_rating is not None and min_rating > 0:
            query = query.filter(Product.rating >= min_rating)

        if in_stock_only:
            query = query.filter(Product.stock > 0)

        if is_featured is not None:
            query = query.filter(Product.is_featured == is_featured)

        if is_trending is not None:
            query = query.filter(Product.is_trending == is_trending)

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(asc(Product.price))
        elif sort_by == "price_desc":
            query = query.order_by(desc(Product.price))
        elif sort_by == "rating":
            query = query.order_by(desc(Product.rating), desc(Product.num_reviews))
        elif sort_by == "popularity":
            query = query.order_by(desc(Product.num_reviews), desc(Product.rating))
        else:  # newest
            query = query.order_by(desc(Product.created_at))

        total = query.count()
        products = query.offset(skip).limit(limit).all()
        return products, total

    @staticmethod
    def create(db: Session, product_in: ProductCreate) -> Product:
        slug = product_in.slug or slugify(product_in.name)
        existing = db.query(Product).filter(Product.slug == slug).first()
        if existing:
            import uuid
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"

        product = Product(
            name=product_in.name,
            slug=slug,
            category_id=product_in.category_id,
            description=product_in.description,
            specifications=product_in.specifications,
            price=product_in.price,
            original_price=product_in.original_price,
            discount_percent=product_in.discount_percent or 0,
            stock=product_in.stock,
            is_featured=product_in.is_featured or False,
            is_trending=product_in.is_trending or False,
            is_active=product_in.is_active if product_in.is_active is not None else True,
            thumbnail=product_in.thumbnail
        )
        db.add(product)
        db.flush()

        # Add images
        if product_in.images:
            for i, img_url in enumerate(product_in.images):
                img = ProductImage(
                    product_id=product.id,
                    image_url=img_url,
                    is_primary=(i == 0)
                )
                db.add(img)
        else:
            # Add primary thumbnail as image
            db.add(ProductImage(
                product_id=product.id,
                image_url=product.thumbnail,
                is_primary=True
            ))

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update(db: Session, product: Product, product_in: ProductUpdate) -> Product:
        update_data = product_in.model_dump(exclude_unset=True)
        images = update_data.pop("images", None)

        for field, value in update_data.items():
            setattr(product, field, value)

        if images is not None:
            # Replace images
            db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
            for i, img_url in enumerate(images):
                db.add(ProductImage(
                    product_id=product.id,
                    image_url=img_url,
                    is_primary=(i == 0)
                ))

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(db: Session, product: Product) -> None:
        db.delete(product)
        db.commit()

