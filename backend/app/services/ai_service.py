import os
import re
import json
import logging
from decimal import Decimal
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.models.product import Product
from app.schemas.chatbot import (
    ChatMessageResponse,
    ProductSummaryCard,
    ProductComparisonResponse,
    OrderSummaryItem,
    CartSummaryResponse,
    ChatActionConfirmation
)
from app.services.faq_service import FAQService
from app.services.chatbot_tools import ChatbotTools

logger = logging.getLogger("ecommerce_website.chatbot")

class AIService:
    """
    Orchestrates Google Gemini API interaction (using official `google-genai` SDK)
    with an intelligent semantic fallback engine.
    Never invents database information; all structured entities come directly from MySQL.
    """

    @classmethod
    def process_message(
        cls,
        db: Session,
        message: str,
        conversation_id: str,
        history: List[Dict[str, str]],
        current_user: Optional[User] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> ChatMessageResponse:
        """
        Main entry point for processing a user query.
        Attempts Google Gemini first if configured; falls back seamlessly to
        intelligent local semantic parser if key is unset, invalid, or quota-limited.
        """
        clean_msg = message.strip()
        
        # Check if Gemini is enabled and configured with a real API key
        api_key = settings.GEMINI_API_KEY
        import sys
        is_testing = "pytest" in sys.modules or os.getenv("ENV") == "test"

        is_gemini_usable = (
            not is_testing
            and api_key is not None 
            and len(api_key.strip()) > 10 
            and "your_actual_gemini" not in api_key.lower()
            and "your_gemini" not in api_key.lower()
        )

        if is_gemini_usable:
            try:
                response = cls._process_with_gemini(
                    db=db,
                    message=clean_msg,
                    conversation_id=conversation_id,
                    history=history,
                    current_user=current_user,
                    context=context
                )
                if response:
                    return response
            except Exception as e:
                logger.warning(f"Google Gemini API call failed ({str(e)}). Engaging intelligent fallback engine.")

        # Seamless Intelligent Dual Engine
        return cls._process_with_fallback_engine(
            db=db,
            message=clean_msg,
            conversation_id=conversation_id,
            history=history,
            current_user=current_user,
            context=context
        )

    # =========================================================================
    # GOOGLE GEMINI SDK INTEGRATION (google-genai)
    # =========================================================================
    @classmethod
    def _process_with_gemini(
        cls,
        db: Session,
        message: str,
        conversation_id: str,
        history: List[Dict[str, str]],
        current_user: Optional[User] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Optional[ChatMessageResponse]:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Define function declarations for Gemini tool calling
        tools_declaration = [
            types.FunctionDeclaration(
                name="search_products",
                description="Search MySQL catalog for real products by keyword query, category, maximum budget, or sorting order",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "query": types.Schema(type=types.Type.STRING, description="Keywords like headphones, dress, shoes, laptop"),
                        "category": types.Schema(type=types.Type.STRING, description="electronics, fashion, home-living, beauty, sports, books"),
                        "max_price": types.Schema(type=types.Type.NUMBER, description="Maximum budget limit in INR (e.g. 50000, 2000)"),
                        "sort_by": types.Schema(type=types.Type.STRING, description="popularity, price_asc, price_desc, rating, discount")
                    }
                )
            ),
            types.FunctionDeclaration(
                name="get_best_deals",
                description="Retrieve currently active discounted offers with highest savings from the catalog",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={}
                )
            ),
            types.FunctionDeclaration(
                name="compare_products",
                description="Compare 2 or more products side by side by name or ID",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "product1": types.Schema(type=types.Type.STRING, description="First product name or keyword"),
                        "product2": types.Schema(type=types.Type.STRING, description="Second product name or keyword")
                    },
                    required=["product1", "product2"]
                )
            ),
            types.FunctionDeclaration(
                name="track_user_order",
                description="Check delivery milestone and status for the currently authenticated customer",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={}
                )
            ),
            types.FunctionDeclaration(
                name="get_cart_status",
                description="View active shopping cart contents and calculated price totals",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={}
                )
            ),
            types.FunctionDeclaration(
                name="get_store_policy_faq",
                description="Retrieve verified store policies for shipping, returns, refunds, cancellations, and customer support",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "topic": types.Schema(type=types.Type.STRING, description="shipping, return, refund, cancellation, payment, support")
                    },
                    required=["topic"]
                )
            )
        ]

        system_instruction = (
            "You are ShopBot, the official AI Shopping Assistant for E-Commerce Website. "
            "You help shoppers discover real products, compare specifications, track authenticated orders, find deals, and answer store policies. "
            "STRICT RULES:\n"
            "1. NEVER invent products, prices, stock, ratings, or discounts. Always call database tools to get real data.\n"
            "2. Never guess order numbers or customer information. Order tracking requires tool execution and authenticated users.\n"
            "3. Return friendly, polite, concise responses."
        )

        # Build contents from history
        contents = []
        for h in history[-4:]:
            role = "user" if h.get("sender") == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=h.get("message", ""))]))
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[types.Tool(function_declarations=tools_declaration)],
            temperature=0.2
        )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=contents,
            config=config
        )

        # Inspect if Gemini made a function call
        if response.function_calls:
            fc = response.function_calls[0]
            fn_name = fc.name
            args = fc.args or {}

            if fn_name == "search_products":
                max_p = Decimal(str(args.get("max_price"))) if args.get("max_price") else None
                prods = ChatbotTools.search_products(
                    db=db,
                    query=args.get("query"),
                    category=args.get("category"),
                    max_price=max_p,
                    sort_by=args.get("sort_by", "popularity"),
                    limit=6
                )
                msg = f"I found {len(prods)} products matching your request:" if prods else "I couldn't find any exact products matching that query. Here are some of our top trending items:"
                if not prods:
                    prods = ChatbotTools.get_trending(db, limit=4)
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message=msg,
                    intent="search_products",
                    products=prods,
                    suggested_followups=["Compare these items", "Show best deals", "Filter under ₹2,000"]
                )

            elif fn_name == "get_best_deals":
                deals = ChatbotTools.get_best_deals(db, limit=6)
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message="🔥 Here are the biggest active discounts available right now on E-Commerce Website:",
                    intent="best_deals",
                    products=deals,
                    suggested_followups=["Electronics deals", "Fashion discounts", "View cart"]
                )

            elif fn_name == "compare_products":
                p1 = args.get("product1", "")
                p2 = args.get("product2", "")
                comparison = ChatbotTools.compare_products(db, [p1, p2])
                if comparison:
                    return ChatMessageResponse(
                        conversation_id=conversation_id,
                        message=f"Here is a side-by-side comparison between **{comparison.products[0].name}** and **{comparison.products[1].name}**:\n\n{comparison.verdict}",
                        intent="compare_products",
                        comparison=comparison,
                        suggested_followups=["Add to cart", "Check delivery time", "See more recommendations"]
                    )
                else:
                    trending = ChatbotTools.get_trending(db, limit=2)
                    comparison = ChatbotTools.compare_products(db, [p.id for p in trending])
                    return ChatMessageResponse(
                        conversation_id=conversation_id,
                        message="Please specify the names of at least two products to compare. Here is a comparison of our top two sellers:",
                        intent="compare_products",
                        comparison=comparison
                    )

            elif fn_name == "track_user_order":
                if not current_user:
                    return ChatMessageResponse(
                        conversation_id=conversation_id,
                        message="🔐 **Authentication Required**: Please sign in to your account so I can look up your orders securely.",
                        intent="auth_required",
                        suggested_followups=["Sign In", "Browse Products", "Store Policies"]
                    )
                orders = ChatbotTools.get_user_orders(db, current_user.id, limit=4)
                if not orders:
                    return ChatMessageResponse(
                        conversation_id=conversation_id,
                        message="You haven't placed any orders yet. When you complete a purchase, your tracking details will appear right here!",
                        intent="track_order",
                        suggested_followups=["Explore Products", "Today's Deals", "Help with Shopping"]
                    )
                latest = orders[0]
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message=f"Here is the tracking for your latest order (**{latest.order_number}**). Current Status: **{latest.status}** with payment **{latest.payment_status}**.",
                    intent="track_order",
                    orders=orders,
                    suggested_followups=["Track another order", "Cancellation policy", "Contact Support"]
                )

            elif fn_name == "get_cart_status":
                if not current_user:
                    return ChatMessageResponse(
                        conversation_id=conversation_id,
                        message="🔐 Please sign in to view your saved cart items and calculate totals.",
                        intent="auth_required"
                    )
                cart = ChatbotTools.get_user_cart(db, current_user.id)
                msg = f"Your cart currently contains **{cart.item_count} items** with a total of **₹{cart.total_amount:,.2f}**." if cart.item_count > 0 else "Your cart is currently empty. Would you like some product recommendations?"
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message=msg,
                    intent="cart_status",
                    cart_summary=cart,
                    suggested_followups=["Checkout", "Recommend Products", "View Deals"]
                )

            elif fn_name == "get_store_policy_faq":
                faq_match = FAQService.search_faq(args.get("topic", message))
                if faq_match:
                    topic, content = faq_match
                    return ChatMessageResponse(
                        conversation_id=conversation_id,
                        message=f"📋 **{topic}**:\n\n{content}",
                        intent="faq",
                        suggested_followups=["Return Policy", "Delivery Charges", "Payment Methods", "Contact Support"]
                    )

        # Normal text response from Gemini
        reply_text = response.text or "How can I assist you with your shopping today?"
        return ChatMessageResponse(
            conversation_id=conversation_id,
            message=reply_text,
            intent="general_chat",
            suggested_followups=["Recommend Products", "Find Best Deals", "Track My Order"]
        )

    # =========================================================================
    # INTELLIGENT LOCAL INTENT & SEMANTIC ENGINE (100% RELIABLE ZERO-CRASH DUAL ENGINE)
    # =========================================================================
    @classmethod
    def _process_with_fallback_engine(
        cls,
        db: Session,
        message: str,
        conversation_id: str,
        history: List[Dict[str, str]],
        current_user: Optional[User] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> ChatMessageResponse:
        """
        Robust semantic parser extracting budget numbers, categories, product keywords,
        order tracking intents, cart manipulations, and FAQs directly from MySQL.
        """
        lowered = message.lower()

        # -------------------------------------------------------------
        # 1. Order Tracking Intent
        # -------------------------------------------------------------
        if any(w in lowered for w in ["track", "where is my order", "order status", "my order", "order details"]):
            if not current_user:
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message="🔐 **Authentication Required**: Please sign in to your account so I can track your orders securely.",
                    intent="auth_required",
                    suggested_followups=["Sign In", "Browse Products", "Store Policies"]
                )
            orders = ChatbotTools.get_user_orders(db, current_user.id, limit=4)
            if not orders:
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message="You haven't placed any orders yet. Once you complete a checkout, live tracking milestones will appear here!",
                    intent="track_order",
                    suggested_followups=["Recommend Products", "Today's Deals", "Help with Shopping"]
                )
            latest = orders[0]
            return ChatMessageResponse(
                conversation_id=conversation_id,
                message=f"I found your recent order records. Your latest order (**{latest.order_number}**) is currently **{latest.status}** with payment **{latest.payment_status}**.",
                intent="track_order",
                orders=orders,
                suggested_followups=["View order history", "Cancel an order", "Contact Support"]
            )

        # -------------------------------------------------------------
        # 2. Cart Assistance Intent
        # -------------------------------------------------------------
        if any(w in lowered for w in ["what's in my cart", "what is in my cart", "cart total", "view cart", "check cart", "my cart"]):
            if not current_user:
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message="🔐 Please sign in to inspect and manage your active shopping cart.",
                    intent="auth_required",
                    suggested_followups=["Sign In", "Explore Catalog"]
                )
            cart = ChatbotTools.get_user_cart(db, current_user.id)
            if cart.item_count == 0:
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message="🛒 Your shopping cart is currently empty. Would you like to check out some popular trending products?",
                    intent="cart",
                    cart_summary=cart,
                    products=ChatbotTools.get_trending(db, limit=3),
                    suggested_followups=["Recommend Products", "Best Deals"]
                )
            return ChatMessageResponse(
                conversation_id=conversation_id,
                message=f"🛒 Your cart currently holds **{cart.item_count} item(s)**. Subtotal: **₹{cart.subtotal:,.2f}**, Discount: **₹{cart.discount_amount:,.2f}**, Total: **₹{cart.total_amount:,.2f}**.",
                intent="cart",
                cart_summary=cart,
                suggested_followups=["Proceed to Checkout", "Find More Deals", "Clear Cart"]
            )

        # Add to cart request
        if "add" in lowered and "cart" in lowered:
            clean_search = re.sub(r'\b(add|to|my|cart|please|can|you|this|product|item)\b', '', lowered).strip()
            prods = ChatbotTools.search_products(db, query=clean_search if len(clean_search) > 2 else None, limit=2)
            if prods:
                target = prods[0]
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message=f"Would you like me to add **{target.name}** (₹{target.price:,.2f}) to your shopping cart?",
                    intent="confirm_add_to_cart",
                    confirmation_required=ChatActionConfirmation(
                        action_type="add_to_cart",
                        title="Add to Shopping Cart",
                        description=f"Add 1x {target.name} for ₹{target.price:,.2f}?",
                        confirm_label="Yes, Add to Cart",
                        cancel_label="No, Cancel",
                        payload={"product_id": target.id, "quantity": 1, "product_name": target.name}
                    ),
                    products=[target]
                )
            else:
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message="Which product would you like to add to your cart? You can search or choose from our featured picks below:",
                    intent="add_to_cart_query",
                    products=ChatbotTools.get_trending(db, limit=3)
                )

        # -------------------------------------------------------------
        # 3. Wishlist Assistance Intent
        # -------------------------------------------------------------
        if any(w in lowered for w in ["wishlist", "saved items", "favorites"]):
            if not current_user:
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message="🔐 Please sign in to view and save items to your wishlist.",
                    intent="auth_required"
                )
            wl_items = ChatbotTools.get_user_wishlist(db, current_user.id)
            if not wl_items:
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message="❤️ Your wishlist is currently empty. Click the heart icon on any product to save it for later!",
                    intent="wishlist",
                    products=ChatbotTools.get_trending(db, limit=3),
                    suggested_followups=["Recommend Products", "Best Deals"]
                )
            return ChatMessageResponse(
                conversation_id=conversation_id,
                message=f"❤️ You have **{len(wl_items)} item(s)** saved in your wishlist:",
                intent="wishlist",
                products=wl_items,
                suggested_followups=["Add all to cart", "Find similar products"]
            )

        # -------------------------------------------------------------
        # 4. Product Comparison Intent
        # -------------------------------------------------------------
        if any(w in lowered for w in ["compare", "vs", "which is better", "difference between"]):
            candidates = []
            all_prods = db.query(Product).filter(Product.is_active == True).all()
            for p in all_prods:
                name_words = [w.lower() for w in p.name.split() if len(w) > 3]
                match_count = sum(1 for nw in name_words if nw in lowered)
                if match_count >= 2 or p.name.lower() in lowered:
                    candidates.append(p.id)

            if len(candidates) < 2:
                cat_match = cls._extract_category(lowered)
                prods = ChatbotTools.search_products(db, category=cat_match, limit=2)
                candidates = [p.id for p in prods]

            comparison = ChatbotTools.compare_products(db, candidates[:2])
            if comparison:
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message=f"Here is the detailed side-by-side comparison between **{comparison.products[0].name}** and **{comparison.products[1].name}**:\n\n{comparison.verdict}",
                    intent="compare_products",
                    comparison=comparison,
                    suggested_followups=["Add top pick to cart", "Compare prices", "Customer reviews"]
                )
            else:
                trending = ChatbotTools.get_trending(db, limit=2)
                comparison = ChatbotTools.compare_products(db, [p.id for p in trending])
                return ChatMessageResponse(
                    conversation_id=conversation_id,
                    message="To compare products, tell me the names of two items (for example: *'Compare Sony headphones and running shoes'*). Here is a comparison of our top two sellers:",
                    intent="compare_products",
                    comparison=comparison
                )

        # -------------------------------------------------------------
        # 5. Best Deals & Offers Intent
        # -------------------------------------------------------------
        if any(w in lowered for w in ["deal", "deals", "offer", "offers", "discount", "discounts", "sale", "lowest price", "cheap"]):
            deals = ChatbotTools.get_best_deals(db, limit=6)
            return ChatMessageResponse(
                conversation_id=conversation_id,
                message="🔥 Here are the biggest active discounts and deals on E-Commerce Website right now:",
                intent="best_deals",
                products=deals,
                suggested_followups=["Electronics deals", "Fashion discounts", "Under ₹2,000"]
            )

        # -------------------------------------------------------------
        # 6. Customer Support & FAQ Intent (RAG)
        # -------------------------------------------------------------
        faq_result = FAQService.search_faq(lowered)
        if faq_result:
            topic, content = faq_result
            return ChatMessageResponse(
                conversation_id=conversation_id,
                message=f"📋 **{topic}**:\n\n{content}",
                intent="faq",
                suggested_followups=["Return Policy", "Shipping Charges", "Payment Methods", "Customer Helpline"]
            )

        # -------------------------------------------------------------
        # 7. Budget / Category / Search Query Intent
        # -------------------------------------------------------------
        max_budget = cls._extract_budget(lowered)
        category_slug = cls._extract_category(lowered)

        stopwords = {
            "suggest", "recommend", "show", "me", "a", "good", "the", "for", "my",
            "friend", "under", "below", "less", "than", "budget", "of", "in", "with",
            "please", "i", "need", "want", "item", "items", "product", "products",
            "gift", "gifts", "find", "some", "any", "thing", "things"
        }
        cleaned_query_tokens = [w for w in re.sub(r'[^a-zA-Z0-9\s]', '', lowered).split() if w not in stopwords and not w.isdigit()]
        cleaned_query = " ".join(cleaned_query_tokens).strip()

        prods = ChatbotTools.search_products(
            db=db,
            query=cleaned_query if len(cleaned_query) > 2 else None,
            category=category_slug,
            max_price=max_budget,
            limit=6
        )

        if not prods and max_budget:
            # Fallback search respecting budget
            prods = ChatbotTools.search_products(db, max_price=max_budget, limit=6)

        if prods:
            budget_str = f" under ₹{max_budget:,.0f}" if max_budget else ""
            msg = f"Here are the best verified products matching **{message}**{budget_str}:"
            return ChatMessageResponse(
                conversation_id=conversation_id,
                message=msg,
                intent="recommend_products",
                products=prods,
                suggested_followups=["Compare these items", "Show highest rated", "Find best deals"]
            )

        # -------------------------------------------------------------
        # 8. Friendly Fallback & Guidance
        # -------------------------------------------------------------
        trending = ChatbotTools.get_trending(db, limit=4)
        return ChatMessageResponse(
            conversation_id=conversation_id,
            message=(
                "I'm here to help you shop! You can ask me to **recommend products** (e.g., *'Suggest a laptop under ₹50,000'*), "
                "**find deals**, **compare products**, **track your order**, or answer store policies. "
                "Here are some popular products you might love:"
            ),
            intent="general_help",
            products=trending,
            suggested_followups=["Recommend Products", "Find Best Deals", "Compare Products", "Track My Order", "Help with Shopping"]
        )

    @staticmethod
    def _extract_budget(text: str) -> Optional[Decimal]:
        k_match = re.search(r'(?:under|below|budget|within|upto)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*k\b', text)
        if k_match:
            return Decimal(k_match.group(1)) * 1000

        match = re.search(r'(?:under|below|budget|within|upto|less than)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d+)?)', text)
        if match:
            clean_num = match.group(1).replace(",", "")
            try:
                val = Decimal(clean_num)
                if val > 0:
                    return val
            except Exception:
                pass
        return None

    @staticmethod
    def _extract_category(text: str) -> Optional[str]:
        cat_map = {
            "electronics": ["laptop", "laptops", "phone", "phones", "smartphone", "smartphones", "headphone", "headphones", "audio", "camera", "electronic", "electronics", "gadget", "charger", "earbuds"],
            "fashion": ["dress", "dresses", "shirt", "shirts", "pant", "pants", "jacket", "jackets", "shoe", "shoes", "sneaker", "sneakers", "fashion", "clothing", "wear", "suit", "silk", "denim"],
            "home-living": ["furniture", "chair", "chairs", "sofa", "lamp", "desk", "home", "living", "pillow", "cookware", "decor"],
            "beauty": ["skincare", "serum", "cream", "fragrance", "perfume", "beauty", "cosmetic", "lipstick", "lotion"],
            "sports": ["fitness", "gym", "yoga", "mat", "sports", "workout", "dumbbell", "exercise", "running"],
            "books": ["book", "books", "novel", "novels", "literature", "reading", "paperback", "author", "fiction"]
        }
        for slug, keywords in cat_map.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', text):
                    return slug
        return None
