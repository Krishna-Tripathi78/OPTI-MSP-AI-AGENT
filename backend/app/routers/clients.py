"""Clients router."""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import List

from app.models.client import Client, ClientCreate, ClientUpdate
from app.database.connection import get_database
from app.database.collections import CLIENTS

router = APIRouter(prefix="/api/clients", tags=["Clients"])


def serialize_client(doc: dict) -> dict:
    """Convert MongoDB document to Client."""
    monthly_revenue = doc.get("monthly_revenue", 0)
    monthly_cost = doc.get("monthly_cost", 0)
    profit_margin = 0
    if monthly_revenue > 0:
        profit_margin = ((monthly_revenue - monthly_cost) / monthly_revenue) * 100
    
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "industry": doc["industry"],
        "contact_email": doc["contact_email"],
        "monthly_revenue": monthly_revenue,
        "monthly_cost": monthly_cost,
        "health_score": doc.get("health_score", 80),
        "status": doc.get("status", "active"),
        "services": doc.get("services", []),
        "profit_margin": round(profit_margin, 2),
        "created_at": doc["created_at"],
        "updated_at": doc.get("updated_at")
    }


@router.get("", response_model=List[Client])
async def get_clients(status: str = None, industry: str = None):
    """Get all clients with optional filters."""
    db = get_database()
    
    # Fallback data when database is offline
    if db is None:
        return [
            {
                "id": "1",
                "name": "Sharma Technologies",
                "industry": "Technology",
                "contact_email": "contact@sharmatech.com",
                "monthly_revenue": 25000.0,
                "monthly_cost": 18000.0,
                "health_score": 92,
                "status": "active",
                "services": [
                    {"name": "IT Support", "monthly_cost": 8000.0},
                    {"name": "Cloud Services", "monthly_cost": 10000.0}
                ],
                "profit_margin": 28.0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": None
            },
            {
                "id": "2",
                "name": "Patel Manufacturing",
                "industry": "Manufacturing",
                "contact_email": "info@patelmfg.com",
                "monthly_revenue": 18000.0,
                "monthly_cost": 12000.0,
                "health_score": 85,
                "status": "active",
                "services": [
                    {"name": "Network Management", "monthly_cost": 7000.0},
                    {"name": "Security", "monthly_cost": 5000.0}
                ],
                "profit_margin": 33.3,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": None
            }
        ]
    
    query = {}
    if status:
        query["status"] = status
    if industry:
        query["industry"] = industry
    
    cursor = db[CLIENTS].find(query)
    clients = await cursor.to_list(200)
    
    return [serialize_client(c) for c in clients]


@router.post("", response_model=Client)
async def create_client(client: ClientCreate):
    """Create a new client."""
    db = get_database()
    
    client_dict = client.model_dump()
    client_dict["created_at"] = datetime.utcnow()
    
    result = await db[CLIENTS].insert_one(client_dict)
    
    created = await db[CLIENTS].find_one({"_id": result.inserted_id})
    return serialize_client(created)


@router.get("/{client_id}", response_model=Client)
async def get_client(client_id: str):
    """Get a specific client with details."""
    db = get_database()
    
    client = await db[CLIENTS].find_one({"_id": ObjectId(client_id)})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return serialize_client(client)


@router.put("/{client_id}", response_model=Client)
async def update_client(client_id: str, update: ClientUpdate):
    """Update a client."""
    db = get_database()
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db[CLIENTS].update_one(
        {"_id": ObjectId(client_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    updated = await db[CLIENTS].find_one({"_id": ObjectId(client_id)})
    return serialize_client(updated)


@router.delete("/{client_id}")
async def delete_client(client_id: str):
    """Delete a client."""
    db = get_database()
    
    result = await db[CLIENTS].delete_one({"_id": ObjectId(client_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return {"message": "Client deleted"}
