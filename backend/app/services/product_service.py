from typing import Optional, List, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.product_repository import ProductRepository
from app.models.product import Product
from app.models.category import Category
from app.models.review import Review
from app.schemas.product import ProductCreate, ProductUpdate
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.utils.validators import slugify

class ProductService:
    @staticmethod
    def get_product(db: Session, product_id: int) -> Product:
        product = ProductRepository.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product

    @staticmethod
    def get_product_by_slug(db: Session, slug: str) -> Product:
        product = ProductRepository.get_by_slug(db, slug)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product

    @staticmethod
    def list_products(
        db: Session,
        page: int = 1,
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
        sort_by: Optional[str] = "newest",
        is_active_only: bool = True
    ) -> Tuple[List[Product], int, int]:
        skip = (page - 1) * limit
        products, total = ProductRepository.list_products(
            db=db,
            skip=skip,
            limit=limit,
            category_slug=category_slug,
            category_id=category_id,
            search=search,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            in_stock_only=in_stock_only,
            is_featured=is_featured,
            is_trending=is_trending,
            sort_by=sort_by,
            is_active_only=is_active_only
        )
        pages = (total + limit - 1) // limit if total > 0 else 1
        return products, total, pages

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate) -> Product:
        if product_in.original_price < product_in.price:
            product_in.original_price = product_in.price
        
        # Calculate discount percent if not set
        if not product_in.discount_percent and product_in.original_price > product_in.price:
            discount = ((product_in.original_price - product_in.price) / product_in.original_price) * 100
            product_in.discount_percent = int(round(discount))
            
        return ProductRepository.create(db, product_in)

    @staticmethod
    def update_product(db: Session, product_id: int, product_in: ProductUpdate) -> Product:
        product = ProductService.get_product(db, product_id)
        return ProductRepository.update(db, product, product_in)

    @staticmethod
    def delete_product(db: Session, product_id: int) -> None:
        product = ProductService.get_product(db, product_id)
        ProductRepository.delete(db, product)

    # Categories
    @staticmethod
    def list_categories(db: Session, is_active_only: bool = True) -> List[Category]:
        query = db.query(Category)
        if is_active_only:
            query = query.filter(Category.is_active == True)
        return query.order_by(Category.name.asc()).all()

    @staticmethod
    def get_category(db: Session, category_id: int) -> Category:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return category

    @staticmethod
    def create_category(db: Session, cat_in: CategoryCreate) -> Category:
        slug = cat_in.slug or slugify(cat_in.name)
        existing = db.query(Category).filter(Category.slug == slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Category with this name or slug already exists")
        
        category = Category(
            name=cat_in.name.strip(),
            slug=slug,
            description=cat_in.description,
            image_url=cat_in.image_url,
            is_active=cat_in.is_active if cat_in.is_active is not None else True
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def update_category(db: Session, category_id: int, cat_in: CategoryUpdate) -> Category:
        cat = ProductService.get_category(db, category_id)
        update_data = cat_in.model_dump(exclude_unset=True)
        if "name" in update_data and not update_data.get("slug"):
            update_data["slug"] = slugify(update_data["name"])
        
        for k, v in update_data.items():
            setattr(cat, k, v)
        db.commit()
        db.refresh(cat)
        return cat

    @staticmethod
    def delete_category(db: Session, category_id: int) -> None:
        cat = ProductService.get_category(db, category_id)
        db.delete(cat)
        db.commit()

