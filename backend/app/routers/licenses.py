"""License optimization router."""
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/licenses", tags=["Licenses"])


@router.get("/optimization")
async def get_license_optimization():
    """Get license optimization recommendations."""
    return {
        "total_licenses": 245,
        "unused_licenses": 32,
        "potential_savings": 8200.0,
        "recommendations": [
            {
                "id": "1",
                "service": "Microsoft 365",
                "current_licenses": 150,
                "used_licenses": 142,
                "unused": 8,
                "monthly_cost_per_license": 12.50,
                "potential_savings": 100.0,
                "recommendation": "Reduce by 8 licenses"
            },
            {
                "id": "2", 
                "service": "Adobe Creative Cloud",
                "current_licenses": 45,
                "used_licenses": 38,
                "unused": 7,
                "monthly_cost_per_license": 52.99,
                "potential_savings": 370.93,
                "recommendation": "Reduce by 7 licenses"
            },
            {
                "id": "3",
                "service": "Slack Pro",
                "current_licenses": 50,
                "used_licenses": 33,
                "unused": 17,
                "monthly_cost_per_license": 7.25,
                "potential_savings": 123.25,
                "recommendation": "Reduce by 17 licenses"
            }
        ]
    }


@router.get("/usage")
async def get_license_usage():
    """Get license usage analytics."""
    return {
        "services": [
            {
                "name": "Microsoft 365",
                "total_licenses": 150,
                "active_users": 142,
                "utilization": 94.7,
                "trend": "stable"
            },
            {
                "name": "Adobe Creative Cloud", 
                "total_licenses": 45,
                "active_users": 38,
                "utilization": 84.4,
                "trend": "declining"
            },
            {
                "name": "Slack Pro",
                "total_licenses": 50,
                "active_users": 33,
                "utilization": 66.0,
                "trend": "declining"
            }
        ]
    }


@router.get("/costs")
async def get_license_costs():
    """Get license cost breakdown."""
    return {
        "total_monthly_cost": 12847.50,
        "breakdown": [
            {
                "service": "Microsoft 365",
                "monthly_cost": 1875.00,
                "percentage": 14.6
            },
            {
                "service": "Adobe Creative Cloud",
                "monthly_cost": 2384.55,
                "percentage": 18.5
            },
            {
                "service": "Slack Pro",
                "monthly_cost": 362.50,
                "percentage": 2.8
            },
            {
                "service": "Other Software",
                "monthly_cost": 8225.45,
                "percentage": 64.1
            }
        ]
    }