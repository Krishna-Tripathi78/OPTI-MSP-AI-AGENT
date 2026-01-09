"""Chat router for AI assistant."""
from fastapi import APIRouter, Depends
from datetime import datetime
from bson import ObjectId
from typing import Optional
import uuid

from app.models.chat import ChatRequest, ChatResponse, ChatMessage
from app.services.azure_openai import generate_chat_response
from app.services.auth_service import get_current_user_optional
from app.database.connection import get_database
from app.database.collections import CHAT_HISTORY

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user = Depends(get_current_user_optional)
):
    """Send a message to the AI assistant."""
    db = get_database()
    
    # Get or create conversation
    conversation_id = request.conversation_id or str(uuid.uuid4())
    user_id = current_user.user_id if current_user else "anonymous"
    
    # Get conversation history
    conversation = await db[CHAT_HISTORY].find_one({"_id": conversation_id})
    history = []
    
    if conversation:
        history = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in conversation.get("messages", [])[-10:]  # Last 10 messages
        ]
    
    # Generate AI response
    ai_response = await generate_chat_response(request.message, history)
    
    # Save to history
    timestamp = datetime.utcnow()
    user_message = ChatMessage(role="user", content=request.message, timestamp=timestamp)
    assistant_message = ChatMessage(role="assistant", content=ai_response, timestamp=timestamp)
    
    if conversation:
        await db[CHAT_HISTORY].update_one(
            {"_id": conversation_id},
            {
                "$push": {
                    "messages": {
                        "$each": [user_message.model_dump(), assistant_message.model_dump()]
                    }
                },
                "$set": {"updated_at": timestamp}
            }
        )
    else:
        await db[CHAT_HISTORY].insert_one({
            "_id": conversation_id,
            "user_id": user_id,
            "messages": [user_message.model_dump(), assistant_message.model_dump()],
            "created_at": timestamp,
            "updated_at": timestamp
        })
    
    return ChatResponse(
        response=ai_response,
        conversation_id=conversation_id,
        timestamp=timestamp
    )


@router.get("/history/{conversation_id}")
async def get_chat_history(
    conversation_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Get chat history for a conversation."""
    db = get_database()
    
    conversation = await db[CHAT_HISTORY].find_one({"_id": conversation_id})
    if not conversation:
        return {"messages": []}
    
    return {
        "conversation_id": conversation_id,
        "messages": conversation.get("messages", [])
    }
