import uuid
import time
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.chatbot import (
    ChatMessageInput,
    ChatMessageResponse,
    ChatbotActionRequest
)
from app.services.ai_service import AIService
from app.services.chatbot_tools import ChatbotTools

# In-memory conversation session store: { conversation_id: { "last_active": ts, "history": [...] } }
# Sessions expire after 2 hours of inactivity to save memory.
SESSION_TIMEOUT_SECONDS = 7200

class ChatbotService:
    _sessions: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def _cleanup_expired_sessions(cls):
        now = time.time()
        expired = [cid for cid, s in cls._sessions.items() if now - s.get("last_active", 0) > SESSION_TIMEOUT_SECONDS]
        for cid in expired:
            cls._sessions.pop(cid, None)

    @classmethod
    def get_or_create_conversation_id(cls, client_id: Optional[str] = None) -> str:
        cls._cleanup_expired_sessions()
        if client_id and client_id in cls._sessions:
            cls._sessions[client_id]["last_active"] = time.time()
            return client_id
        
        new_id = client_id or str(uuid.uuid4())
        cls._sessions[new_id] = {
            "last_active": time.time(),
            "history": []
        }
        return new_id

    @classmethod
    def process_user_message(
        cls,
        db: Session,
        msg_in: ChatMessageInput,
        current_user: Optional[User] = None
    ) -> ChatMessageResponse:
        cid = cls.get_or_create_conversation_id(msg_in.conversation_id)
        session = cls._sessions[cid]
        history = session["history"]

        # Call AI service
        response = AIService.process_message(
            db=db,
            message=msg_in.message,
            conversation_id=cid,
            history=history,
            current_user=current_user,
            context=msg_in.context
        )

        # Update history
        history.append({"sender": "user", "message": msg_in.message})
        history.append({"sender": "bot", "message": response.message})
        # Keep last 10 messages for context
        if len(history) > 10:
            session["history"] = history[-10:]

        return response

    @classmethod
    def execute_action(
        cls,
        db: Session,
        action_in: ChatbotActionRequest,
        current_user: Optional[User] = None
    ) -> ChatMessageResponse:
        cid = cls.get_or_create_conversation_id(action_in.conversation_id)

        if action_in.action == "confirm_add_to_cart":
            if not current_user:
                return ChatMessageResponse(
                    conversation_id=cid,
                    message="🔐 Please sign in to add this product to your cart.",
                    intent="auth_required"
                )

            product_id = action_in.payload.get("product_id")
            quantity = action_in.payload.get("quantity", 1)

            success, msg, prod = ChatbotTools.add_to_cart(db, current_user.id, int(product_id), int(quantity))
            cart = ChatbotTools.get_user_cart(db, current_user.id)

            return ChatMessageResponse(
                conversation_id=cid,
                message=msg,
                intent="action_result",
                cart_summary=cart,
                suggested_followups=["View Cart", "Proceed to Checkout", "Continue Shopping"]
            )

        elif action_in.action == "cancel_action":
            return ChatMessageResponse(
                conversation_id=cid,
                message="Action cancelled. How else can I help you?",
                intent="action_cancelled",
                suggested_followups=["Recommend Products", "Find Deals", "Help with Shopping"]
            )

        return ChatMessageResponse(
            conversation_id=cid,
            message="Action completed.",
            intent="action_result"
        )

    @classmethod
    def reset_conversation(cls, conversation_id: str) -> bool:
        if conversation_id in cls._sessions:
            cls._sessions[conversation_id]["history"] = []
            cls._sessions[conversation_id]["last_active"] = time.time()
            return True
        return False

