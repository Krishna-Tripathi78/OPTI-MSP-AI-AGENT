from typing import Dict, List
from fastapi import WebSocket
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str, room: str = "dashboard"):
        await websocket.accept()
        
        if room not in self.active_connections:
            self.active_connections[room] = []
        
        self.active_connections[room].append(websocket)
        self.user_connections[user_id] = websocket
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "message": f"Connected to {room}",
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)

    def disconnect(self, websocket: WebSocket, user_id: str, room: str = "dashboard"):
        if room in self.active_connections:
            self.active_connections[room].remove(websocket)
        
        if user_id in self.user_connections:
            del self.user_connections[user_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

    async def broadcast_to_room(self, message: dict, room: str = "dashboard"):
        if room in self.active_connections:
            for connection in self.active_connections[room]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    # Remove dead connections
                    self.active_connections[room].remove(connection)

    async def send_to_user(self, message: dict, user_id: str):
        if user_id in self.user_connections:
            try:
                await self.user_connections[user_id].send_text(json.dumps(message))
            except:
                del self.user_connections[user_id]

manager = ConnectionManager()


async def broadcast_live_updates():
    """Broadcast live dashboard updates every 30 seconds"""
    while True:
        await asyncio.sleep(30)
        live_data = {
            "type": "dashboard_update",
            "data": {
                "active_tickets": 47,
                "revenue_today": 12450,
                "system_health": 94,
                "alerts_count": 3
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await manager.broadcast_to_room(live_data, "dashboard")