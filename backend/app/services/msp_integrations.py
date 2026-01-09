"""
MSP Tools Integration Service
Integrates with popular MSP tools: ConnectWise, Autotask, Kaseya, etc.
"""
import aiohttp
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
from app.config import get_settings

settings = get_settings()

class MSPToolsIntegration:
    def __init__(self):
        self.session = None
        self.integrations = {
            "connectwise": ConnectWiseAPI(),
            "autotask": AutotaskAPI(),
            "kaseya": KaseyaAPI(),
            "microsoft365": Microsoft365API(),
            "azure": AzureAPI(),
            "slack": SlackAPI()
        }

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

class ConnectWiseAPI:
    """ConnectWise Manage API Integration"""
    
    def __init__(self):
        self.base_url = "https://api-na.myconnectwise.net/v4_6_release/apis/3.0"
        self.headers = {
            "Authorization": f"Basic {settings.connectwise_api_key}",
            "Content-Type": "application/json",
            "clientId": settings.connectwise_client_id
        }

    async def get_tickets(self, session: aiohttp.ClientSession, status: str = "open") -> List[Dict]:
        """Fetch tickets from ConnectWise"""
        try:
            url = f"{self.base_url}/service/tickets"
            params = {"conditions": f"status/name='{status}'", "pageSize": 100}
            
            async with session.get(url, headers=self.headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [
                        {
                            "id": ticket["id"],
                            "summary": ticket.get("summary", ""),
                            "status": ticket.get("status", {}).get("name", ""),
                            "priority": ticket.get("priority", {}).get("name", ""),
                            "client": ticket.get("company", {}).get("name", ""),
                            "assigned_to": ticket.get("owner", {}).get("name", ""),
                            "created_date": ticket.get("dateEntered", ""),
                            "last_updated": ticket.get("lastUpdated", "")
                        }
                        for ticket in data
                    ]
                else:
                    return []
        except Exception as e:
            print(f"ConnectWise API error: {e}")
            return []

    async def get_time_entries(self, session: aiohttp.ClientSession, days: int = 30) -> List[Dict]:
        """Fetch time entries from ConnectWise"""
        try:
            start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
            url = f"{self.base_url}/time/entries"
            params = {
                "conditions": f"dateEntered>=[{start_date}]",
                "pageSize": 500
            }
            
            async with session.get(url, headers=self.headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [
                        {
                            "id": entry["id"],
                            "member": entry.get("member", {}).get("name", ""),
                            "client": entry.get("company", {}).get("name", ""),
                            "hours": entry.get("actualHours", 0),
                            "billable": entry.get("billableOption", "") == "Billable",
                            "date": entry.get("dateEntered", ""),
                            "description": entry.get("notes", "")
                        }
                        for entry in data
                    ]
                else:
                    return []
        except Exception as e:
            print(f"ConnectWise time entries error: {e}")
            return []

class Microsoft365API:
    """Microsoft 365 Admin API Integration"""
    
    def __init__(self):
        self.base_url = "https://graph.microsoft.com/v1.0"
        self.headers = {
            "Authorization": f"Bearer {settings.microsoft365_token}",
            "Content-Type": "application/json"
        }

    async def get_license_usage(self, session: aiohttp.ClientSession) -> Dict:
        """Get Microsoft 365 license usage statistics"""
        try:
            url = f"{self.base_url}/reports/getOffice365ActiveUserDetail(period='D30')"
            
            async with session.get(url, headers=self.headers) as response:
                if response.status == 200:
                    data = await response.text()
                    # Parse CSV response
                    lines = data.strip().split('\n')
                    if len(lines) > 1:
                        headers = lines[0].split(',')
                        users = []
                        for line in lines[1:]:
                            values = line.split(',')
                            user_data = dict(zip(headers, values))
                            users.append({
                                "user_principal_name": user_data.get("User Principal Name", ""),
                                "display_name": user_data.get("Display Name", ""),
                                "last_activity": user_data.get("Last Activity Date", ""),
                                "assigned_products": user_data.get("Assigned Products", "").split(';'),
                                "is_active": user_data.get("Last Activity Date", "") != ""
                            })
                        
                        return {
                            "total_users": len(users),
                            "active_users": len([u for u in users if u["is_active"]]),
                            "utilization_rate": len([u for u in users if u["is_active"]]) / len(users) * 100,
                            "users": users
                        }
                else:
                    return {"error": "Failed to fetch license data"}
        except Exception as e:
            print(f"Microsoft 365 API error: {e}")
            return {"error": str(e)}

    async def get_security_alerts(self, session: aiohttp.ClientSession) -> List[Dict]:
        """Get security alerts from Microsoft 365"""
        try:
            url = f"{self.base_url}/security/alerts"
            params = {"$top": 50, "$orderby": "createdDateTime desc"}
            
            async with session.get(url, headers=self.headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [
                        {
                            "id": alert["id"],
                            "title": alert.get("title", ""),
                            "severity": alert.get("severity", ""),
                            "status": alert.get("status", ""),
                            "category": alert.get("category", ""),
                            "created_date": alert.get("createdDateTime", ""),
                            "description": alert.get("description", "")
                        }
                        for alert in data.get("value", [])
                    ]
                else:
                    return []
        except Exception as e:
            print(f"Microsoft 365 security alerts error: {e}")
            return []

class AzureAPI:
    """Azure Resource Management API Integration"""
    
    def __init__(self):
        self.base_url = "https://management.azure.com"
        self.headers = {
            "Authorization": f"Bearer {settings.azure_token}",
            "Content-Type": "application/json"
        }

    async def get_cost_analysis(self, session: aiohttp.ClientSession, subscription_id: str) -> Dict:
        """Get Azure cost analysis"""
        try:
            url = f"{self.base_url}/subscriptions/{subscription_id}/providers/Microsoft.CostManagement/query"
            
            payload = {
                "type": "ActualCost",
                "timeframe": "MonthToDate",
                "dataset": {
                    "granularity": "Daily",
                    "aggregation": {
                        "totalCost": {
                            "name": "PreTaxCost",
                            "function": "Sum"
                        }
                    },
                    "grouping": [
                        {
                            "type": "Dimension",
                            "name": "ResourceGroup"
                        }
                    ]
                }
            }
            
            async with session.post(url, headers=self.headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "total_cost": sum(row[0] for row in data.get("properties", {}).get("rows", [])),
                        "cost_by_resource_group": [
                            {
                                "resource_group": row[1],
                                "cost": row[0],
                                "date": row[2]
                            }
                            for row in data.get("properties", {}).get("rows", [])
                        ]
                    }
                else:
                    return {"error": "Failed to fetch cost data"}
        except Exception as e:
            print(f"Azure cost analysis error: {e}")
            return {"error": str(e)}

    async def get_resource_health(self, session: aiohttp.ClientSession, subscription_id: str) -> List[Dict]:
        """Get Azure resource health status"""
        try:
            url = f"{self.base_url}/subscriptions/{subscription_id}/providers/Microsoft.ResourceHealth/availabilityStatuses"
            params = {"api-version": "2020-05-01"}
            
            async with session.get(url, headers=self.headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [
                        {
                            "resource_id": status["id"],
                            "resource_name": status["name"],
                            "availability_state": status.get("properties", {}).get("availabilityState", ""),
                            "summary": status.get("properties", {}).get("summary", ""),
                            "reason_type": status.get("properties", {}).get("reasonType", ""),
                            "occurred_time": status.get("properties", {}).get("occurredTime", "")
                        }
                        for status in data.get("value", [])
                    ]
                else:
                    return []
        except Exception as e:
            print(f"Azure resource health error: {e}")
            return []

class AutotaskAPI:
    """Autotask PSA API Integration"""
    
    def __init__(self):
        self.base_url = "https://webservices.autotask.net/atservicesrest/v1.0"
        self.headers = {
            "ApiIntegrationcode": settings.autotask_integration_code,
            "UserName": settings.autotask_username,
            "Secret": settings.autotask_secret,
            "Content-Type": "application/json"
        }

    async def get_contracts(self, session: aiohttp.ClientSession) -> List[Dict]:
        """Fetch contracts from Autotask"""
        try:
            url = f"{self.base_url}/Contracts/query"
            params = {"search": '{"filter":[{"op":"eq","field":"status","value":"1"}]}'}
            
            async with session.get(url, headers=self.headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [
                        {
                            "id": contract["id"],
                            "name": contract.get("contractName", ""),
                            "client": contract.get("companyName", ""),
                            "start_date": contract.get("startDate", ""),
                            "end_date": contract.get("endDate", ""),
                            "contract_value": contract.get("contractValue", 0),
                            "status": contract.get("status", "")
                        }
                        for contract in data.get("items", [])
                    ]
                else:
                    return []
        except Exception as e:
            print(f"Autotask contracts error: {e}")
            return []

class KaseyaAPI:
    """Kaseya VSA API Integration"""
    
    def __init__(self):
        self.base_url = settings.kaseya_server_url
        self.headers = {
            "Authorization": f"Bearer {settings.kaseya_token}",
            "Content-Type": "application/json"
        }

    async def get_agent_status(self, session: aiohttp.ClientSession) -> List[Dict]:
        """Get Kaseya agent status"""
        try:
            url = f"{self.base_url}/api/v1.0/assetmgmt/agents"
            
            async with session.get(url, headers=self.headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return [
                        {
                            "agent_id": agent["AgentId"],
                            "computer_name": agent.get("ComputerName", ""),
                            "group_name": agent.get("GroupName", ""),
                            "online_status": agent.get("OnlineStatus", ""),
                            "last_checkin": agent.get("LastCheckIn", ""),
                            "os_info": agent.get("OSInfo", "")
                        }
                        for agent in data.get("Result", [])
                    ]
                else:
                    return []
        except Exception as e:
            print(f"Kaseya agent status error: {e}")
            return []

class SlackAPI:
    """Slack API Integration for notifications"""
    
    def __init__(self):
        self.base_url = "https://slack.com/api"
        self.headers = {
            "Authorization": f"Bearer {settings.slack_bot_token}",
            "Content-Type": "application/json"
        }

    async def send_alert(self, session: aiohttp.ClientSession, channel: str, message: str) -> bool:
        """Send alert to Slack channel"""
        try:
            url = f"{self.base_url}/chat.postMessage"
            payload = {
                "channel": channel,
                "text": message,
                "username": "OptiMSP Bot",
                "icon_emoji": ":warning:"
            }
            
            async with session.post(url, headers=self.headers, json=payload) as response:
                return response.status == 200
        except Exception as e:
            print(f"Slack API error: {e}")
            return False

# Global integration instance
msp_integrations = MSPToolsIntegration()