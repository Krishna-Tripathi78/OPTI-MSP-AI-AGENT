"""
MSP Integrations Router - Real MSP tool API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Dict, Optional
from app.services.msp_integrations import msp_integrations
from app.services.auth_service import get_current_user
from app.database.connection import get_database

router = APIRouter(prefix="/integrations", tags=["MSP Integrations"])

@router.get("/connectwise/tickets")
async def get_connectwise_tickets(
    status: str = "open"
):
    """Fetch tickets from ConnectWise Manage"""
    try:
        async with msp_integrations as integration:
            tickets = await integration.integrations["connectwise"].get_tickets(
                integration.session, status
            )
            return {
                "source": "ConnectWise Manage",
                "total_tickets": len(tickets),
                "tickets": tickets,
                "last_sync": "2024-01-15T10:30:00Z"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ConnectWise integration failed: {str(e)}")

@router.get("/connectwise/time-entries")
async def get_connectwise_time_entries(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Fetch time entries from ConnectWise"""
    try:
        async with msp_integrations as integration:
            entries = await integration.integrations["connectwise"].get_time_entries(
                integration.session, days
            )
            
            # Calculate summary statistics
            total_hours = sum(entry["hours"] for entry in entries)
            billable_hours = sum(entry["hours"] for entry in entries if entry["billable"])
            
            return {
                "source": "ConnectWise Manage",
                "period_days": days,
                "total_entries": len(entries),
                "total_hours": total_hours,
                "billable_hours": billable_hours,
                "utilization_rate": (billable_hours / total_hours * 100) if total_hours > 0 else 0,
                "entries": entries
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ConnectWise time tracking failed: {str(e)}")

@router.get("/microsoft365/licenses")
async def get_microsoft365_licenses():
    """Get Microsoft 365 license usage"""
    try:
        async with msp_integrations as integration:
            license_data = await integration.integrations["microsoft365"].get_license_usage(
                integration.session
            )
            
            return {
                "source": "Microsoft 365 Admin Center",
                "license_usage": license_data,
                "optimization_opportunities": {
                    "unused_licenses": license_data.get("total_users", 0) - license_data.get("active_users", 0),
                    "potential_savings": (license_data.get("total_users", 0) - license_data.get("active_users", 0)) * 12 * 12,  # $12/month per license
                    "recommendations": [
                        "Remove unused licenses",
                        "Review inactive users",
                        "Consider license downgrade for low-usage users"
                    ]
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Microsoft 365 integration failed: {str(e)}")

@router.get("/microsoft365/security-alerts")
async def get_microsoft365_security_alerts(
    current_user: dict = Depends(get_current_user)
):
    """Get Microsoft 365 security alerts"""
    try:
        async with msp_integrations as integration:
            alerts = await integration.integrations["microsoft365"].get_security_alerts(
                integration.session
            )
            
            # Categorize alerts by severity
            high_severity = [a for a in alerts if a["severity"] == "high"]
            medium_severity = [a for a in alerts if a["severity"] == "medium"]
            low_severity = [a for a in alerts if a["severity"] == "low"]
            
            return {
                "source": "Microsoft 365 Security Center",
                "total_alerts": len(alerts),
                "severity_breakdown": {
                    "high": len(high_severity),
                    "medium": len(medium_severity),
                    "low": len(low_severity)
                },
                "alerts": alerts,
                "action_required": len(high_severity) > 0
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Microsoft 365 security integration failed: {str(e)}")

@router.get("/azure/cost-analysis/{subscription_id}")
async def get_azure_costs(
    subscription_id: str
):
    """Get Azure cost analysis"""
    try:
        async with msp_integrations as integration:
            cost_data = await integration.integrations["azure"].get_cost_analysis(
                integration.session, subscription_id
            )
            
            return {
                "source": "Azure Cost Management",
                "subscription_id": subscription_id,
                "cost_analysis": cost_data,
                "optimization_insights": {
                    "highest_cost_resource_group": max(
                        cost_data.get("cost_by_resource_group", []),
                        key=lambda x: x["cost"],
                        default={"resource_group": "N/A", "cost": 0}
                    ),
                    "recommendations": [
                        "Review high-cost resource groups",
                        "Consider reserved instances for consistent workloads",
                        "Enable auto-shutdown for development resources"
                    ]
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Azure integration failed: {str(e)}")

@router.get("/azure/resource-health/{subscription_id}")
async def get_azure_resource_health(
    subscription_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get Azure resource health status"""
    try:
        async with msp_integrations as integration:
            health_data = await integration.integrations["azure"].get_resource_health(
                integration.session, subscription_id
            )
            
            # Categorize by availability state
            available = [r for r in health_data if r["availability_state"] == "Available"]
            unavailable = [r for r in health_data if r["availability_state"] == "Unavailable"]
            degraded = [r for r in health_data if r["availability_state"] == "Degraded"]
            
            return {
                "source": "Azure Resource Health",
                "subscription_id": subscription_id,
                "total_resources": len(health_data),
                "health_summary": {
                    "available": len(available),
                    "unavailable": len(unavailable),
                    "degraded": len(degraded),
                    "overall_health": "Good" if len(unavailable) == 0 else "Issues Detected"
                },
                "resources": health_data
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Azure health check failed: {str(e)}")

@router.get("/autotask/contracts")
async def get_autotask_contracts(
    current_user: dict = Depends(get_current_user)
):
    """Get contracts from Autotask PSA"""
    try:
        async with msp_integrations as integration:
            contracts = await integration.integrations["autotask"].get_contracts(
                integration.session
            )
            
            # Calculate contract analytics
            total_value = sum(contract["contract_value"] for contract in contracts)
            avg_value = total_value / len(contracts) if contracts else 0
            
            return {
                "source": "Autotask PSA",
                "total_contracts": len(contracts),
                "total_value": total_value,
                "average_value": avg_value,
                "contracts": contracts,
                "insights": {
                    "highest_value_contract": max(contracts, key=lambda x: x["contract_value"], default={}),
                    "expiring_soon": [
                        c for c in contracts 
                        if c["end_date"] and c["end_date"] < "2024-03-01"  # Next 2 months
                    ]
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Autotask integration failed: {str(e)}")

@router.get("/kaseya/agents")
async def get_kaseya_agents():
    """Get Kaseya agent status"""
    try:
        async with msp_integrations as integration:
            agents = await integration.integrations["kaseya"].get_agent_status(
                integration.session
            )
            
            # Categorize agents by status
            online = [a for a in agents if a["online_status"] == "Online"]
            offline = [a for a in agents if a["online_status"] == "Offline"]
            
            return {
                "source": "Kaseya VSA",
                "total_agents": len(agents),
                "online_agents": len(online),
                "offline_agents": len(offline),
                "availability_rate": (len(online) / len(agents) * 100) if agents else 0,
                "agents": agents,
                "alerts": [
                    {
                        "type": "offline_agents",
                        "count": len(offline),
                        "severity": "high" if len(offline) > 5 else "medium",
                        "message": f"{len(offline)} agents are currently offline"
                    }
                ] if offline else []
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kaseya integration failed: {str(e)}")

@router.post("/slack/send-alert")
async def send_slack_alert(
    channel: str,
    message: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Send alert to Slack channel"""
    try:
        async def send_alert():
            async with msp_integrations as integration:
                success = await integration.integrations["slack"].send_alert(
                    integration.session, channel, message
                )
                return success
        
        background_tasks.add_task(send_alert)
        
        return {
            "status": "queued",
            "message": "Alert queued for delivery to Slack",
            "channel": channel
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Slack integration failed: {str(e)}")

@router.get("/sync-all")
async def sync_all_integrations(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Sync data from all integrated MSP tools"""
    try:
        async def sync_data():
            sync_results = {}
            
            async with msp_integrations as integration:
                # Sync ConnectWise tickets
                try:
                    tickets = await integration.integrations["connectwise"].get_tickets(integration.session)
                    sync_results["connectwise_tickets"] = len(tickets)
                    # Store in database
                    if tickets:
                        await db.external_tickets.delete_many({"source": "connectwise"})
                        for ticket in tickets:
                            ticket["source"] = "connectwise"
                            await db.external_tickets.insert_one(ticket)
                except Exception as e:
                    sync_results["connectwise_error"] = str(e)
                
                # Sync Microsoft 365 data
                try:
                    license_data = await integration.integrations["microsoft365"].get_license_usage(integration.session)
                    sync_results["microsoft365_users"] = license_data.get("total_users", 0)
                    # Store in database
                    await db.license_usage.replace_one(
                        {"source": "microsoft365"},
                        {"source": "microsoft365", "data": license_data, "last_sync": "2024-01-15T10:30:00Z"},
                        upsert=True
                    )
                except Exception as e:
                    sync_results["microsoft365_error"] = str(e)
            
            return sync_results
        
        background_tasks.add_task(sync_data)
        
        return {
            "status": "started",
            "message": "Data synchronization started in background",
            "estimated_completion": "2-3 minutes"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")