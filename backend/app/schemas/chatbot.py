from typing import Optional, List, Dict, Any
from decimal import Decimal
from pydantic import BaseModel, Field

class ChatMessageInput(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User message text")
    conversation_id: Optional[str] = Field(None, description="Client conversation tracking ID")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Client context like current page")

class ChatbotActionRequest(BaseModel):
    action: str = Field(..., description="Action name, e.g. confirm_add_to_cart")
    conversation_id: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)

class ProductSummaryCard(BaseModel):
    id: int
    name: str
    slug: str
    price: Decimal
    original_price: Decimal
    discount_percent: int
    stock: int
    rating: Decimal
    num_reviews: int
    thumbnail: str
    category_name: str
    specifications: Optional[str] = None

class ProductComparisonItem(BaseModel):
    id: int
    name: str
    slug: str
    price: Decimal
    original_price: Decimal
    discount_percent: int
    rating: Decimal
    stock: int
    thumbnail: str
    specs_dict: Dict[str, str] = Field(default_factory=dict)

class ProductComparisonResponse(BaseModel):
    products: List[ProductComparisonItem]
    compared_attributes: List[str]
    verdict: str

class OrderSummaryItem(BaseModel):
    id: int
    order_number: str
    created_at: str
    status: str
    payment_status: str
    payment_method: str
    total_amount: Decimal
    item_count: int
    items: List[Dict[str, Any]]
    shipping_city: Optional[str] = None

class CartSummaryResponse(BaseModel):
    item_count: int
    subtotal: Decimal
    discount_amount: Decimal
    delivery_charge: Decimal
    total_amount: Decimal
    items: List[Dict[str, Any]] = []

class ChatActionConfirmation(BaseModel):
    action_type: str
    title: str
    description: str
    confirm_label: str
    cancel_label: str
    payload: Dict[str, Any]

class ChatMessageResponse(BaseModel):
    conversation_id: str
    sender: str = "bot"
    message: str
    intent: Optional[str] = None
    products: List[ProductSummaryCard] = []
    comparison: Optional[ProductComparisonResponse] = None
    orders: List[OrderSummaryItem] = []
    cart_summary: Optional[CartSummaryResponse] = None
    confirmation_required: Optional[ChatActionConfirmation] = None
    quick_actions: List[str] = []
    suggested_followups: List[str] = []
    created_at: Optional[str] = None

