"""Dashboard router for business metrics."""
from fastapi import APIRouter
from app.models.dashboard import DashboardMetrics, RevenueDataPoint
from app.database.connection import get_database
from app.database.collections import CLIENTS, TEAM_MEMBERS, ANOMALIES

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    """Get main dashboard KPI metrics."""
    db = get_database()
    
    # Count clients
    total_clients = await db[CLIENTS].count_documents({})
    active_clients = await db[CLIENTS].count_documents({"status": "active"})
    
    # Calculate revenue and costs
    pipeline = [
        {"$match": {"status": "active"}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": "$monthly_revenue"},
            "total_cost": {"$sum": "$monthly_cost"}
        }}
    ]
    revenue_result = await db[CLIENTS].aggregate(pipeline).to_list(1)
    
    total_revenue = 0
    total_cost = 0
    profit_margin = 0
    
    if revenue_result:
        total_revenue = revenue_result[0].get("total_revenue", 0)
        total_cost = revenue_result[0].get("total_cost", 0)
        if total_revenue > 0:
            profit_margin = ((total_revenue - total_cost) / total_revenue) * 100
    
    # Team members
    total_team = await db[TEAM_MEMBERS].count_documents({})
    
    # Anomalies
    anomalies_count = await db[ANOMALIES].count_documents({"status": "open"})
    
    # Calculate retention (mock for now - would need historical data)
    retention_rate = 94.5 if active_clients > 0 else 0
    
    # Average client value
    avg_client_value = total_revenue / active_clients if active_clients > 0 else 0
    
    return DashboardMetrics(
        total_revenue=total_revenue,
        total_clients=total_clients,
        active_clients=active_clients,
        retention_rate=retention_rate,
        profit_margin=round(profit_margin, 2),
        avg_client_value=round(avg_client_value, 2),
        total_team_members=total_team,
        open_tickets=0,  # Would need tickets collection
        resolved_tickets=0,
        anomalies_count=anomalies_count
    )


@router.get("/revenue-trend")
async def get_revenue_trend():
    """Get monthly revenue trend data for charts."""
    # This would aggregate real data by month
    # For now, return sample structure
    return [
        {"month": "Jan", "revenue": 180000, "cost": 140000, "profit": 40000},
        {"month": "Feb", "revenue": 195000, "cost": 145000, "profit": 50000},
        {"month": "Mar", "revenue": 210000, "cost": 155000, "profit": 55000},
        {"month": "Apr", "revenue": 225000, "cost": 165000, "profit": 60000},
        {"month": "May", "revenue": 240000, "cost": 175000, "profit": 65000},
        {"month": "Jun", "revenue": 250000, "cost": 180000, "profit": 70000},
    ]
