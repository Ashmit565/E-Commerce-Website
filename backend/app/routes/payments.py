from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.payment import PaymentCreateRequest, PaymentVerifyRequest, PaymentOut
from app.services.payment_service import PaymentService
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create")
def create_payment(
    req: PaymentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return PaymentService.create_payment(db, current_user.id, req)

@router.post("/verify", response_model=PaymentOut)
def verify_payment(
    req: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return PaymentService.verify_payment(db, current_user.id, req)

