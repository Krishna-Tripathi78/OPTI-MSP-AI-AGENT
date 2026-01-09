"""
AI Analytics Router - Advanced ML endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.services.predictive_analytics import predictive_analytics
from app.services.auth_service import get_current_user
from app.database.connection import get_database

router = APIRouter(prefix="/ai-analytics", tags=["AI Analytics"])

@router.get("/churn-prediction")
async def get_churn_predictions(
    db = Depends(get_database)
):
    """Get client churn predictions using ML model"""
    try:
        # Fetch clients data
        clients_cursor = db.clients.find({"status": "active"})
        clients_data = await clients_cursor.to_list(length=None)
        
        # Get predictions
        predictions = await predictive_analytics.predict_client_churn(clients_data)
        
        return {
            "predictions": predictions,
            "summary": {
                "total_clients": len(clients_data),
                "high_risk": len([p for p in predictions if p["risk_level"] == "High"]),
                "medium_risk": len([p for p in predictions if p["risk_level"] == "Medium"]),
                "low_risk": len([p for p in predictions if p["risk_level"] == "Low"])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/revenue-forecast")
async def get_revenue_forecast(
    months: int = 6,
    db = Depends(get_database)
):
    """Get revenue forecast for next N months"""
    try:
        # Generate mock historical data (in real app, fetch from DB)
        historical_data = [
            {"month": f"2024-{i:02d}", "revenue": 2000000 + (i * 50000) + (i * i * 1000)}
            for i in range(1, 13)
        ]
        
        forecast = await predictive_analytics.forecast_revenue(historical_data)
        
        return {
            "historical_data": historical_data[-6:],  # Last 6 months
            "forecast": forecast,
            "generated_at": "2024-01-15T10:00:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {str(e)}")

@router.get("/cost-anomalies")
async def detect_cost_anomalies(
    days: int = 30,
    db = Depends(get_database)
):
    """Detect cost anomalies using ML"""
    try:
        # Generate mock cost data (in real app, fetch from DB)
        import random
        from datetime import datetime, timedelta
        
        cost_data = []
        base_date = datetime.now() - timedelta(days=days)
        
        for i in range(days * 5):  # 5 transactions per day average
            cost_data.append({
                "id": i,
                "amount": random.uniform(100, 5000) if random.random() > 0.05 else random.uniform(8000, 15000),
                "description": f"Service cost {i}",
                "date": (base_date + timedelta(days=i//5)).isoformat(),
                "category_id": random.randint(1, 5),
                "day_of_week": (base_date + timedelta(days=i//5)).weekday(),
                "hour_of_day": random.randint(8, 18)
            })
        
        anomalies = await predictive_analytics.detect_cost_anomalies(cost_data)
        
        return {
            "anomalies": anomalies,
            "total_transactions": len(cost_data),
            "anomaly_rate": round(len(anomalies) / len(cost_data) * 100, 2),
            "total_anomalous_amount": sum(a["amount"] for a in anomalies)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@router.get("/performance-insights")
async def get_performance_insights(
    db = Depends(get_database)
):
    """Get AI-powered performance insights"""
    try:
        # Fetch team and client data
        team_cursor = db.team_members.find({"status": "active"})
        team_data = await team_cursor.to_list(length=None)
        
        clients_cursor = db.clients.find({"status": "active"})
        clients_data = await clients_cursor.to_list(length=None)
        
        # Generate insights
        insights = {
            "team_performance": {
                "top_performer": max(team_data, key=lambda x: x.get("performance_score", 0))["name"],
                "avg_performance": sum(t.get("performance_score", 0) for t in team_data) / len(team_data),
                "improvement_needed": [
                    t["name"] for t in team_data 
                    if t.get("performance_score", 0) < 80
                ]
            },
            "client_insights": {
                "most_profitable": max(clients_data, key=lambda x: x.get("monthly_revenue", 0) - x.get("monthly_cost", 0))["name"],
                "avg_health_score": sum(c.get("health_score", 0) for c in clients_data) / len(clients_data),
                "at_risk_clients": [
                    c["name"] for c in clients_data 
                    if c.get("health_score", 100) < 70
                ]
            },
            "recommendations": [
                "Focus on improving client health scores below 70",
                "Optimize costs for unprofitable clients",
                "Provide additional training for underperforming team members",
                "Consider expanding services for high-performing clients"
            ]
        }
        
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")

@router.post("/optimize-resources")
async def optimize_resources(
    optimization_type: str,
    db = Depends(get_database)
):
    """AI-powered resource optimization recommendations"""
    try:
        if optimization_type == "licenses":
            return {
                "optimization_type": "licenses",
                "current_utilization": 73,
                "potential_savings": 15420,
                "recommendations": [
                    "Remove 12 unused Microsoft 365 licenses",
                    "Downgrade 8 premium licenses to standard",
                    "Consolidate duplicate Zoom subscriptions"
                ],
                "implementation_priority": "High"
            }
        
        elif optimization_type == "infrastructure":
            return {
                "optimization_type": "infrastructure",
                "current_efficiency": 68,
                "potential_savings": 8750,
                "recommendations": [
                    "Right-size 3 over-provisioned Azure VMs",
                    "Enable auto-scaling for variable workloads",
                    "Archive unused storage volumes"
                ],
                "implementation_priority": "Medium"
            }
        
        else:
            raise HTTPException(status_code=400, detail="Invalid optimization type")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")