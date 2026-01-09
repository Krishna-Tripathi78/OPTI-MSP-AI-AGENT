"""MSP Tools Integration Service - Mock Version for Demo"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
from app.config import get_settings

settings = get_settings()

class MSPToolsIntegration:
    def __init__(self):
        self.session = None
        self.integrations = {
            "connectwise": MockConnectWiseAPI(),
            "microsoft365": MockMicrosoft365API(),
            "azure": MockAzureAPI(),
            "autotask": MockAutotaskAPI(),
            "kaseya": MockKaseyaAPI(),
            "slack": MockSlackAPI()
        }

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

class MockConnectWiseAPI:
    """Mock ConnectWise API for demo"""
    
    async def get_tickets(self, session, status: str = "open") -> List[Dict]:
        return [
            {
                "id": 1001,
                "summary": "Email server down - Sharma Technologies",
                "status": "Open",
                "priority": "High",
                "client": "Sharma Technologies",
                "assigned_to": "Rajesh Sharma",
                "created_date": "2024-01-15T09:30:00Z",
                "last_updated": "2024-01-15T10:15:00Z"
            },
            {
                "id": 1002,
                "summary": "VPN connectivity issues - Patel Manufacturing",
                "status": "In Progress",
                "priority": "Medium",
                "client": "Patel Manufacturing",
                "assigned_to": "Amit Kumar",
                "created_date": "2024-01-15T08:45:00Z",
                "last_updated": "2024-01-15T09:20:00Z"
            }
        ]

    async def get_time_entries(self, session, days: int = 30) -> List[Dict]:
        return [
            {
                "id": 2001,
                "member": "Rajesh Sharma",
                "client": "Sharma Technologies",
                "hours": 4.5,
                "billable": True,
                "date": "2024-01-15",
                "description": "Email server maintenance"
            },
            {
                "id": 2002,
                "member": "Amit Kumar",
                "client": "Patel Manufacturing",
                "hours": 2.0,
                "billable": True,
                "date": "2024-01-15",
                "description": "VPN troubleshooting"
            }
        ]

class MockMicrosoft365API:
    """Mock Microsoft 365 API for demo"""
    
    async def get_license_usage(self, session) -> Dict:
        return {
            "total_users": 150,
            "active_users": 127,
            "utilization_rate": 84.7,
            "users": [
                {
                    "user_principal_name": "john.doe@company.com",
                    "display_name": "John Doe",
                    "last_activity": "2024-01-15",
                    "assigned_products": ["Office 365 E3"],
                    "is_active": True
                }
            ]
        }

    async def get_security_alerts(self, session) -> List[Dict]:
        return [
            {
                "id": "alert-001",
                "title": "Suspicious login activity detected",
                "severity": "high",
                "status": "active",
                "category": "Identity",
                "created_date": "2024-01-15T08:30:00Z",
                "description": "Multiple failed login attempts from unusual location"
            }
        ]

class MockAzureAPI:
    """Mock Azure API for demo"""
    
    async def get_cost_analysis(self, session, subscription_id: str) -> Dict:
        return {
            "total_cost": 15420.50,
            "cost_by_resource_group": [
                {"resource_group": "production-rg", "cost": 8500.25, "date": "2024-01-15"},
                {"resource_group": "development-rg", "cost": 3200.15, "date": "2024-01-15"},
                {"resource_group": "staging-rg", "cost": 3720.10, "date": "2024-01-15"}
            ]
        }

    async def get_resource_health(self, session, subscription_id: str) -> List[Dict]:
        return [
            {
                "resource_id": "/subscriptions/123/resourceGroups/prod/providers/Microsoft.Compute/virtualMachines/vm1",
                "resource_name": "production-vm-01",
                "availability_state": "Available",
                "summary": "Resource is healthy",
                "reason_type": "None",
                "occurred_time": "2024-01-15T10:00:00Z"
            }
        ]

class MockAutotaskAPI:
    """Mock Autotask API for demo"""
    
    async def get_contracts(self, session) -> List[Dict]:
        return [
            {
                "id": 3001,
                "name": "Managed Services - Sharma Tech",
                "client": "Sharma Technologies",
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "contract_value": 300000,
                "status": "Active"
            }
        ]

class MockKaseyaAPI:
    """Mock Kaseya API for demo"""
    
    async def get_agent_status(self, session) -> List[Dict]:
        return [
            {
                "agent_id": "agent-001",
                "computer_name": "SHARMA-DC01",
                "group_name": "Servers",
                "online_status": "Online",
                "last_checkin": "2024-01-15T10:30:00Z",
                "os_info": "Windows Server 2019"
            },
            {
                "agent_id": "agent-002",
                "computer_name": "PATEL-WS01",
                "group_name": "Workstations",
                "online_status": "Offline",
                "last_checkin": "2024-01-14T18:45:00Z",
                "os_info": "Windows 11 Pro"
            }
        ]

class MockSlackAPI:
    """Mock Slack API for demo"""
    
    async def send_alert(self, session, channel: str, message: str) -> bool:
        print(f"Mock Slack alert sent to {channel}: {message}")
        return True

# Global integration instance
msp_integrations = MSPToolsIntegration()