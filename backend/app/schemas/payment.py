from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel

class PaymentCreateRequest(BaseModel):
    order_id: int
    payment_method: str = "simulated"  # "simulated", "upi", "card", "cod"

class PaymentVerifyRequest(BaseModel):
    order_id: int
    payment_id: Optional[str] = None
    transaction_id: str
    signature: Optional[str] = None
    status: str = "success"  # "success" or "failed"
    is_simulated: Optional[bool] = True

class PaymentOut(BaseModel):
    id: int
    order_id: int
    user_id: int
    payment_method: str
    transaction_id: str
    amount: Decimal
    status: str
    gateway_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

