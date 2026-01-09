"""Chat models for AI assistant."""
from pydantic import BaseModel
from typing import Optional, Literal, List
from datetime import datetime


class ChatMessage(BaseModel):
    """Single chat message."""
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime = None
    
    def __init__(self, **data):
        if data.get("timestamp") is None:
            data["timestamp"] = datetime.utcnow()
        super().__init__(**data)


class ChatRequest(BaseModel):
    """Request to send a message to AI."""
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """AI response."""
    response: str
    conversation_id: str
    timestamp: datetime


class ChatHistory(BaseModel):
    """Chat conversation history."""
    id: str
    user_id: str
    messages: List[ChatMessage] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
