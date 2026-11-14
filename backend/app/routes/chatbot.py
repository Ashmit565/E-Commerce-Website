from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.dependencies.auth import get_current_user_optional
from app.schemas.chatbot import (
    ChatMessageInput,
    ChatMessageResponse,
    ChatbotActionRequest
)
from app.services.chatbot_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.post("/message", response_model=ChatMessageResponse)
def send_message(
    msg_in: ChatMessageInput,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Main conversational endpoint for ShopBot.
    Accepts text queries, understands natural language shopping intent,
    and returns verified MySQL database results.
    """
    return ChatbotService.process_user_message(db, msg_in, current_user)

@router.post("/action", response_model=ChatMessageResponse)
def execute_chatbot_action(
    action_in: ChatbotActionRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Executes a confirmed chatbot action (e.g. user confirmed adding an item to their cart).
    """
    return ChatbotService.execute_action(db, action_in, current_user)

@router.post("/reset")
def reset_conversation(
    payload: Dict[str, str],
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Resets the conversation history for a given conversation_id.
    """
    cid = payload.get("conversation_id", "")
    ChatbotService.reset_conversation(cid)
    return {"status": "success", "message": "Conversation history reset successfully"}

@router.get("/quick-actions", response_model=List[str])
def get_quick_actions(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Returns suggested quick action prompt pills based on user login state.
    """
    actions = [
        "Recommend Products",
        "Find Best Deals",
        "Compare Products",
        "Help with Shopping"
    ]
    if current_user:
        actions.insert(3, "Track My Order")
    else:
        actions.insert(3, "Store Policies & FAQs")
    return actions

