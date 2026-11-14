from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.review import Review
from app.models.order import Order, OrderItem
from app.schemas.review import ReviewOut, ReviewCreate
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="", tags=["Reviews"])

@router.get("/products/{product_id}/reviews", response_model=List[ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()

@router.post("/products/{product_id}/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_product_review(
    product_id: int,
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Optional rule: check if user purchased product
    # We can allow reviews or verify purchase:
    # A user can review a purchased product or generally leave feedback
    existing = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user.id
    ).first()

    if existing:
        existing.rating = review_in.rating
        existing.title = review_in.title
        existing.comment = review_in.comment
        review = existing
    else:
        review = Review(
            product_id=product_id,
            user_id=current_user.id,
            rating=review_in.rating,
            title=review_in.title,
            comment=review_in.comment
        )
        db.add(review)

    db.commit()

    # Recalculate average rating & review count for the product
    stats = db.query(
        func.coalesce(func.avg(Review.rating), 0),
        func.count(Review.id)
    ).filter(Review.product_id == product_id).first()

    avg_rating = round(Decimal(str(stats[0])), 1)
    num_reviews = stats[1]

    product.rating = avg_rating
    product.num_reviews = num_reviews
    db.commit()
    db.refresh(review)

    return review

