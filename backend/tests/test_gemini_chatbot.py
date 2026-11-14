import sys
import os
from decimal import Decimal
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.cart import Cart, CartItem
from app.schemas.chatbot import ChatMessageInput, ChatbotActionRequest
from app.services.chatbot_service import ChatbotService
from app.services.chatbot_tools import ChatbotTools
from app.services.faq_service import FAQService
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Seed Category
    cat = Category(name="Electronics", slug="electronics")
    db.add(cat)
    db.commit()

    # Seed 2 Products
    p1 = Product(
        name="Sony WH-1000XM5 Wireless Headphones",
        slug="sony-wh-1000xm5-wireless-headphones",
        category_id=cat.id,
        description="Industry leading noise cancellation wireless headphones",
        specifications="Brand: Sony\nBattery: 30 hours\nWarranty: 1 Year",
        price=Decimal("26990.00"),
        original_price=Decimal("34990.00"),
        discount_percent=23,
        stock=15,
        rating=Decimal("4.8"),
        num_reviews=140,
        is_active=True,
        is_featured=True,
        is_trending=True,
        thumbnail="https://example.com/sony.jpg"
    )
    p2 = Product(
        name="Budget Bluetooth Earbuds",
        slug="budget-bluetooth-earbuds",
        category_id=cat.id,
        description="True wireless stereo earbuds with charging case",
        specifications="Brand: SoundPro\nBattery: 20 hours\nWarranty: 6 Months",
        price=Decimal("1499.00"),
        original_price=Decimal("2999.00"),
        discount_percent=50,
        stock=40,
        rating=Decimal("4.4"),
        num_reviews=85,
        is_active=True,
        is_featured=False,
        is_trending=True,
        thumbnail="https://example.com/earbuds.jpg"
    )
    db.add(p1)
    db.add(p2)

    # Seed User
    user = User(
        email="shopper@example.com",
        hashed_password="hashedpassword123",
        full_name="Sarah Shopper",
        role="customer",
        is_active=True
    )
    db.add(user)
    db.commit()

    # Seed Order for user
    order = Order(
        order_number="ORD-20261114-123456",
        user_id=user.id,
        status="Confirmed",
        payment_status="completed",
        payment_method="UPI",
        subtotal=Decimal("26990.00"),
        discount_amount=Decimal("0.00"),
        delivery_charge=Decimal("0.00"),
        total_amount=Decimal("26990.00"),
        shipping_address_snapshot='{"city": "Bengaluru", "state": "Karnataka"}'
    )
    db.add(order)
    db.flush()

    o_item = OrderItem(
        order_id=order.id,
        product_id=p1.id,
        product_name=p1.name,
        product_image=p1.thumbnail,
        price=p1.price,
        original_price=p1.original_price,
        quantity=1,
        total_price=p1.price
    )
    db.add(o_item)
    db.commit()

    yield db, user, p1, p2
    db.close()

def test_recommendation_and_search(test_db):
    db, user, p1, p2 = test_db
    msg = ChatMessageInput(message="Suggest wireless headphones")
    res = ChatbotService.process_user_message(db, msg, None)
    assert res.sender == "bot"
    assert len(res.products) > 0
    assert any("Sony" in p.name for p in res.products)

def test_budget_filter(test_db):
    db, user, p1, p2 = test_db
    msg = ChatMessageInput(message="Show items under 2000")
    res = ChatbotService.process_user_message(db, msg, None)
    assert len(res.products) > 0
    for p in res.products:
        assert float(p.price) <= 2000.0

def test_best_deals(test_db):
    db, user, p1, p2 = test_db
    msg = ChatMessageInput(message="What are the best offers?")
    res = ChatbotService.process_user_message(db, msg, None)
    assert res.intent == "best_deals"
    assert len(res.products) > 0
    assert res.products[0].discount_percent >= 20

def test_product_comparison(test_db):
    db, user, p1, p2 = test_db
    msg = ChatMessageInput(message="Compare Sony headphones and bluetooth earbuds")
    res = ChatbotService.process_user_message(db, msg, None)
    assert res.intent == "compare_products"
    assert res.comparison is not None
    assert len(res.comparison.products) == 2
    assert "Recommendation" in res.comparison.verdict or "Top" in res.comparison.verdict

def test_order_tracking_unauthenticated(test_db):
    db, user, p1, p2 = test_db
    msg = ChatMessageInput(message="Where is my order?")
    res = ChatbotService.process_user_message(db, msg, None)
    assert res.intent == "auth_required"
    assert "sign in" in res.message.lower()

def test_order_tracking_authenticated(test_db):
    db, user, p1, p2 = test_db
    msg = ChatMessageInput(message="Where is my order?")
    res = ChatbotService.process_user_message(db, msg, user)
    assert res.intent == "track_order"
    assert len(res.orders) == 1
    assert res.orders[0].order_number == "ORD-20261114-123456"
    assert res.orders[0].status == "Confirmed"

def test_faq_policy_retrieval(test_db):
    db, user, p1, p2 = test_db
    msg = ChatMessageInput(message="What is the return period?")
    res = ChatbotService.process_user_message(db, msg, None)
    assert res.intent == "faq"
    assert "7-Day" in res.message or "Replacement" in res.message

def test_add_to_cart_confirmation_flow(test_db):
    db, user, p1, p2 = test_db
    # 1. Ask bot to add item to cart
    msg = ChatMessageInput(message=f"Add {p2.name} to cart")
    res = ChatbotService.process_user_message(db, msg, user)
    assert res.confirmation_required is not None
    assert res.confirmation_required.payload["product_id"] == p2.id

    # 2. Confirm action
    action = ChatbotActionRequest(
        action="confirm_add_to_cart",
        payload=res.confirmation_required.payload
    )
    action_res = ChatbotService.execute_action(db, action, user)
    assert "Successfully added" in action_res.message
    assert action_res.cart_summary is not None
    assert action_res.cart_summary.item_count == 1

def test_conversation_reset(test_db):
    db, user, p1, p2 = test_db
    cid = "test-session-reset-42"
    msg = ChatMessageInput(message="Suggest headphones", conversation_id=cid)
    ChatbotService.process_user_message(db, msg, user)
    assert cid in ChatbotService._sessions
    assert len(ChatbotService._sessions[cid]["history"]) > 0

    success = ChatbotService.reset_conversation(cid)
    assert success is True
    assert len(ChatbotService._sessions[cid]["history"]) == 0

