import json
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.payment import Payment
from app.models.order import Order
from app.schemas.payment import PaymentCreateRequest, PaymentVerifyRequest
from app.utils.validators import generate_transaction_id

class PaymentService:
    @staticmethod
    def create_payment(db: Session, user_id: int, req: PaymentCreateRequest) -> dict:
        order = db.query(Order).filter(Order.id == req.order_id, Order.user_id == user_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        if order.status == "Cancelled":
            raise HTTPException(status_code=400, detail="Cannot pay for a cancelled order")

        # Generate transaction reference
        txn_id = generate_transaction_id("PAY")

        # Check existing payment
        payment = db.query(Payment).filter(Payment.order_id == order.id).first()
        if not payment:
            payment = Payment(
                order_id=order.id,
                user_id=user_id,
                payment_method=req.payment_method,
                transaction_id=txn_id,
                amount=order.total_amount,
                status="pending",
                gateway_response=json.dumps({
                    "initiated_at": str(datetime.utcnow()),
                    "method": req.payment_method,
                    "simulated": req.payment_method in ["simulated", "card", "upi"]
                })
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)

        return {
            "order_id": order.id,
            "order_number": order.order_number,
            "amount": float(order.total_amount),
            "currency": "INR",
            "transaction_id": payment.transaction_id,
            "payment_method": req.payment_method,
            "is_simulated": True,
            "status": payment.status
        }

    @staticmethod
    def verify_payment(db: Session, user_id: int, req: PaymentVerifyRequest) -> Payment:
        order = db.query(Order).filter(Order.id == req.order_id, Order.user_id == user_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        payment = db.query(Payment).filter(Payment.order_id == order.id).first()
        if not payment:
            payment = Payment(
                order_id=order.id,
                user_id=user_id,
                payment_method=order.payment_method,
                transaction_id=req.transaction_id or generate_transaction_id("TXN"),
                amount=order.total_amount,
                status="pending"
            )
            db.add(payment)

        # Verification logic
        if req.status == "success":
            payment.status = "completed"
            payment.gateway_response = json.dumps({
                "verified": True,
                "verified_at": str(datetime.utcnow()),
                "is_simulated": req.is_simulated,
                "note": "Payment verified by Secure Payment System"
            })
            order.payment_status = "completed"
            if order.status == "Pending":
                order.status = "Confirmed"
        else:
            payment.status = "failed"
            payment.gateway_response = json.dumps({
                "verified": False,
                "verified_at": str(datetime.utcnow()),
                "error": "Payment failed or was cancelled by user"
            })
            order.payment_status = "failed"

        db.commit()
        db.refresh(payment)
        return payment

