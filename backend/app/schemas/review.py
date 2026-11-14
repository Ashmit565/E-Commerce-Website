from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: str = Field(..., min_length=3)

class UserReviewer(BaseModel):
    id: int
    full_name: str

    class Config:
        from_attributes = True

class ReviewOut(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    title: Optional[str] = None
    comment: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserReviewer] = None

    class Config:
        from_attributes = True

