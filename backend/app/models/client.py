"""Client models."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ServiceDetail(BaseModel):
    """Service detail for a client."""
    name: str
    monthly_cost: float
    status: str = "active"


class ClientBase(BaseModel):
    """Base client fields."""
    name: str
    industry: str
    contact_email: str
    monthly_revenue: float
    monthly_cost: float
    health_score: float = Field(ge=0, le=100)
    status: str = "active"
    services: List[ServiceDetail] = []


class ClientCreate(ClientBase):
    """Schema for creating a client."""
    pass


class ClientUpdate(BaseModel):
    """Schema for updating a client."""
    name: Optional[str] = None
    industry: Optional[str] = None
    contact_email: Optional[str] = None
    monthly_revenue: Optional[float] = None
    monthly_cost: Optional[float] = None
    health_score: Optional[float] = None
    status: Optional[str] = None


class Client(ClientBase):
    """Full client with ID and computed fields."""
    id: str
    profit_margin: float = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    def __init__(self, **data):
        super().__init__(**data)
        if self.monthly_revenue > 0:
            self.profit_margin = ((self.monthly_revenue - self.monthly_cost) / self.monthly_revenue) * 100
