"""Team member models."""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class TeamMemberBase(BaseModel):
    """Base team member fields."""
    name: str
    email: str
    role: str
    department: Literal["Technical", "Operations", "Security", "Support", "Sales"]
    status: Literal["active", "inactive", "on-leave"] = "active"
    performance_score: Optional[float] = Field(default=0, ge=0, le=100)
    tickets_resolved: Optional[int] = 0
    avatar: Optional[str] = None


class TeamMemberCreate(TeamMemberBase):
    """Schema for creating a team member."""
    pass


class TeamMemberUpdate(BaseModel):
    """Schema for updating a team member."""
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    performance_score: Optional[float] = None
    tickets_resolved: Optional[int] = None


class TeamMember(TeamMemberBase):
    """Full team member with ID."""
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
