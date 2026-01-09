"""Dashboard and anomaly models."""
from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime


class DashboardMetrics(BaseModel):
    """Main dashboard KPI metrics."""
    total_revenue: float
    total_clients: int
    active_clients: int
    retention_rate: float = Field(ge=0, le=100)
    profit_margin: float
    avg_client_value: float
    total_team_members: int
    open_tickets: int
    resolved_tickets: int
    anomalies_count: int


class RevenueDataPoint(BaseModel):
    """Revenue data for charts."""
    month: str
    revenue: float
    cost: float
    profit: float


class AnomalyBase(BaseModel):
    """Base anomaly fields."""
    title: str
    description: str
    severity: Literal["high", "medium", "low"]
    category: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    impact_amount: Optional[float] = None


class AnomalyCreate(AnomalyBase):
    """Create an anomaly."""
    pass


class Anomaly(AnomalyBase):
    """Full anomaly with ID."""
    id: str
    status: Literal["open", "investigating", "resolved"] = "open"
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None


class AnomalyResolve(BaseModel):
    """Resolve an anomaly."""
    resolution_notes: Optional[str] = None
