import json
from io import BytesIO
from decimal import Decimal
from typing import Optional, List, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.address import Address
from app.models.cart import Cart, CartItem
from app.models.payment import Payment
from app.repositories.order_repository import OrderRepository
from app.schemas.order import OrderCreate, OrderCancelRequest
from app.utils.validators import generate_order_number, generate_transaction_id
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

FREE_DELIVERY_THRESHOLD = Decimal("500.00")
STANDARD_DELIVERY_FEE = Decimal("50.00")

class OrderService:
    @staticmethod
    def create_order_from_cart(db: Session, user_id: int, order_in: OrderCreate) -> Order:
        # Validate delivery address
        address = db.query(Address).filter(
            Address.id == order_in.address_id,
            Address.user_id == user_id
        ).first()
        if not address:
            raise HTTPException(status_code=400, detail="Invalid shipping address selected")

        address_snapshot = json.dumps({
            "full_name": address.full_name,
            "phone_number": address.phone_number,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2,
            "city": address.city,
            "state": address.state,
            "postal_code": address.postal_code,
            "country": address.country
        })

        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart or not cart.items:
            raise HTTPException(status_code=400, detail="Cannot create order from an empty cart")

        # Start transaction block
        try:
            subtotal = Decimal("0.00")
            original_total = Decimal("0.00")
            order_items_to_create = []

            # Lock rows or check stock concurrency
            for cart_item in cart.items:
                # SELECT ... FOR UPDATE if supported (MySQL), fallback for SQLite
                product_query = db.query(Product).filter(Product.id == cart_item.product_id)
                if db.bind.dialect.name == "mysql":
                    product_query = product_query.with_for_update()
                
                product = product_query.first()
                if not product or not product.is_active:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Product {cart_item.product_id} is no longer available"
                    )

                if product.stock < cart_item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}, in cart: {cart_item.quantity}"
                    )

                # Deduct inventory immediately as part of transaction
                product.stock -= cart_item.quantity

                price = Decimal(str(product.price))
                orig_price = Decimal(str(product.original_price))
                item_total = price * cart_item.quantity
                item_orig_total = orig_price * cart_item.quantity

                subtotal += item_total
                original_total += item_orig_total

                order_items_to_create.append({
                    "product_id": product.id,
                    "product_name": product.name,
                    "product_image": product.thumbnail,
                    "price": price,
                    "original_price": orig_price,
                    "quantity": cart_item.quantity,
                    "total_price": item_total
                })

            discount_amount = original_total - subtotal
            if discount_amount < Decimal("0.00"):
                discount_amount = Decimal("0.00")

            delivery_charge = Decimal("0.00") if subtotal >= FREE_DELIVERY_THRESHOLD else STANDARD_DELIVERY_FEE
            total_amount = subtotal + delivery_charge

            order_number = generate_order_number()

            # Determine initial payment status
            payment_status = "pending"
            order_status = "Pending"
            if order_in.payment_method.lower() == "cod":
                payment_status = "pending"
                order_status = "Confirmed"
            elif order_in.payment_method.lower() == "simulated":
                payment_status = "completed"
                order_status = "Confirmed"

            order = Order(
                order_number=order_number,
                user_id=user_id,
                address_id=address.id,
                status=order_status,
                subtotal=subtotal,
                discount_amount=discount_amount,
                delivery_charge=delivery_charge,
                total_amount=total_amount,
                payment_method=order_in.payment_method.lower(),
                payment_status=payment_status,
                shipping_address_snapshot=address_snapshot
            )
            db.add(order)
            db.flush()

            # Create OrderItems
            for item_data in order_items_to_create:
                db_item = OrderItem(
                    order_id=order.id,
                    product_id=item_data["product_id"],
                    product_name=item_data["product_name"],
                    product_image=item_data["product_image"],
                    price=item_data["price"],
                    original_price=item_data["original_price"],
                    quantity=item_data["quantity"],
                    total_price=item_data["total_price"]
                )
                db.add(db_item)

            # If simulated payment, record payment record
            if order_in.payment_method.lower() == "simulated":
                payment = Payment(
                    order_id=order.id,
                    user_id=user_id,
                    payment_method="simulated",
                    transaction_id=generate_transaction_id("SIM"),
                    amount=total_amount,
                    status="completed",
                    gateway_response=json.dumps({"mode": "simulated", "verified": True, "timestamp": str(datetime.utcnow())})
                )
                db.add(payment)

            # Clear user cart items
            db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

            db.commit()
            db.refresh(order)
            return order

        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Failed to place order: {str(e)}")

    @staticmethod
    def cancel_order(db: Session, order_id: int, user_id: int, cancel_in: OrderCancelRequest) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Authorization: user or admin
        if order.user_id != user_id:
            user = db.query(Order.user).filter(Order.id == order_id).first()
            # If called from admin route, check role separately

        # Order status eligibility: Can only cancel if Pending, Confirmed, or Processing
        non_cancellable = ["Shipped", "Delivered", "Cancelled"]
        if order.status in non_cancellable:
            raise HTTPException(
                status_code=400,
                detail=f"Order cannot be cancelled in '{order.status}' status"
            )

        try:
            # Restore stock for each item
            for item in order.items:
                if item.product_id:
                    prod = db.query(Product).filter(Product.id == item.product_id).first()
                    if prod:
                        prod.stock += item.quantity

            order.status = "Cancelled"
            order.cancel_reason = cancel_in.reason or "Cancelled by user"
            if order.payment_status == "completed":
                order.payment_status = "refunded"

            db.commit()
            db.refresh(order)
            return order
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to cancel order: {str(e)}")

    @staticmethod
    def generate_invoice_pdf(order: Order) -> BytesIO:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            textColor=colors.HexColor("#6426C8"),
            spaceAfter=10
        )
        subtitle_style = ParagraphStyle(
            'SubtitleStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor("#4A5568")
        )
        h2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            textColor=colors.HexColor("#1A202C"),
            spaceBefore=15,
            spaceAfter=8
        )

        elements.append(Paragraph("E-Commerce Website Invoice", title_style))
        elements.append(Paragraph(f"Order #: {order.order_number} | Date: {order.created_at.strftime('%B %d, %Y')}", subtitle_style))
        elements.append(Paragraph(f"Payment Method: {order.payment_method.upper()} | Status: {order.status}", subtitle_style))
        elements.append(Spacer(1, 15))

        # Shipping details
        try:
            addr = json.loads(order.shipping_address_snapshot)
            addr_text = f"<b>Billed & Shipped To:</b><br/>{addr.get('full_name')}<br/>{addr.get('address_line1')}, {addr.get('city')}, {addr.get('state')} - {addr.get('postal_code')}<br/>Phone: {addr.get('phone_number')}"
        except Exception:
            addr_text = "<b>Billed & Shipped To:</b><br/>Customer Address"
        
        elements.append(Paragraph(addr_text, subtitle_style))
        elements.append(Spacer(1, 15))

        # Items Table
        table_data = [["Product", "Price", "Qty", "Total"]]
        for item in order.items:
            table_data.append([
                Paragraph(item.product_name, subtitle_style),
                f"Rs. {item.price:.2f}",
                str(item.quantity),
                f"Rs. {item.total_price:.2f}"
            ])

        table_data.append(["", "", "Subtotal:", f"Rs. {order.subtotal:.2f}"])
        if order.discount_amount > 0:
            table_data.append(["", "", "Discount:", f"- Rs. {order.discount_amount:.2f}"])
        table_data.append(["", "", "Delivery:", f"Rs. {order.delivery_charge:.2f}"])
        table_data.append(["", "", "Total Amount:", f"Rs. {order.total_amount:.2f}"])

        t = Table(table_data, colWidths=[260, 90, 60, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F3E8FF")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#6426C8")),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, len(order.items)), 0.5, colors.HexColor("#E2E8F0")),
            ('FONTNAME', (2, -1), (3, -1), 'Helvetica-Bold'),
            ('LINEABOVE', (2, -1), (3, -1), 1, colors.HexColor("#6426C8")),
            ('TOPPADDING', (0, -4), (-1, -1), 6),
            ('BOTTOMPADDING', (0, -4), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 25))
        elements.append(Paragraph("Thank you for shopping with E-Commerce Website! For questions contact support@ecommercewebsite.com.", subtitle_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer

