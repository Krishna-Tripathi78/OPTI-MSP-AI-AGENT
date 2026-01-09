"""
WebSocket Router - Real-time communication endpoints
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.websocket_manager import manager
# WebSocket auth will be handled separately
import json

router = APIRouter()

@router.websocket("/ws/dashboard/{user_id}")
async def websocket_dashboard(websocket: WebSocket, user_id: str):
    """Real-time dashboard updates"""
    await manager.connect(websocket, user_id, "dashboard")
    
    try:
        while True:
            # Listen for client messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "ping":
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": message.get("timestamp")
                }, websocket)
                
            elif message["type"] == "request_update":
                # Send immediate dashboard update
                await manager.send_personal_message({
                    "type": "dashboard_update",
                    "data": {
                        "revenue": 2300000,
                        "clients": 157,
                        "health_score": 87,
                        "profit_margin": 23
                    }
                }, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, "dashboard")

@router.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: str):
    """Real-time notifications"""
    await manager.connect(websocket, user_id, "notifications")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle notification acknowledgments
            if message["type"] == "notification_read":
                await manager.broadcast_to_room({
                    "type": "notification_updated",
                    "notification_id": message["notification_id"],
                    "status": "read"
                }, "notifications")
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, "notifications")

@router.websocket("/ws/team/{user_id}")
async def websocket_team_collaboration(websocket: WebSocket, user_id: str):
    """Real-time team collaboration"""
    await manager.connect(websocket, user_id, "team")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "team_member_added":
                # Broadcast new team member to all connected users
                await manager.broadcast_to_room({
                    "type": "team_update",
                    "action": "member_added",
                    "data": message["data"]
                }, "team")
                
            elif message["type"] == "performance_update":
                # Broadcast performance updates
                await manager.broadcast_to_room({
                    "type": "performance_update",
                    "member_id": message["member_id"],
                    "metrics": message["metrics"]
                }, "team")
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, "team")