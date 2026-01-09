"""Anomalies router."""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import List

from app.models.dashboard import Anomaly, AnomalyCreate, AnomalyResolve
from app.database.connection import get_database
from app.database.collections import ANOMALIES

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])


def serialize_anomaly(doc: dict) -> dict:
    """Convert MongoDB document to Anomaly."""
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "description": doc["description"],
        "severity": doc["severity"],
        "category": doc["category"],
        "client_id": doc.get("client_id"),
        "client_name": doc.get("client_name"),
        "impact_amount": doc.get("impact_amount"),
        "status": doc.get("status", "open"),
        "detected_at": doc["detected_at"],
        "resolved_at": doc.get("resolved_at"),
        "resolution_notes": doc.get("resolution_notes")
    }


@router.get("", response_model=List[Anomaly])
async def get_anomalies(status: str = None, severity: str = None):
    """Get all anomalies with optional filters."""
    db = get_database()
    
    # Fallback data when database is offline
    if db is None:
        return [
            {
                "id": "1",
                "title": "High CPU Usage",
                "description": "Server CPU usage exceeded 90%",
                "severity": "high",
                "category": "performance",
                "client_id": "1",
                "client_name": "Sharma Technologies",
                "impact_amount": 1200.0,
                "status": "open",
                "detected_at": "2024-01-09T08:00:00Z",
                "resolved_at": None,
                "resolution_notes": None
            }
        ]
    
    query = {}
    if status:
        query["status"] = status
    if severity:
        query["severity"] = severity
    
    cursor = db[ANOMALIES].find(query).sort("detected_at", -1)
    anomalies = await cursor.to_list(100)
    
    return [serialize_anomaly(a) for a in anomalies]


@router.post("", response_model=Anomaly)
async def create_anomaly(anomaly: AnomalyCreate):
    """Create a new anomaly (usually done by detection system)."""
    db = get_database()
    
    anomaly_dict = anomaly.model_dump()
    anomaly_dict["detected_at"] = datetime.utcnow()
    anomaly_dict["status"] = "open"
    
    result = await db[ANOMALIES].insert_one(anomaly_dict)
    
    created = await db[ANOMALIES].find_one({"_id": result.inserted_id})
    return serialize_anomaly(created)


@router.get("/{anomaly_id}", response_model=Anomaly)
async def get_anomaly(anomaly_id: str):
    """Get a specific anomaly."""
    db = get_database()
    
    anomaly = await db[ANOMALIES].find_one({"_id": ObjectId(anomaly_id)})
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    
    return serialize_anomaly(anomaly)


@router.put("/{anomaly_id}/resolve", response_model=Anomaly)
async def resolve_anomaly(anomaly_id: str, resolve: AnomalyResolve):
    """Mark an anomaly as resolved."""
    db = get_database()
    
    result = await db[ANOMALIES].update_one(
        {"_id": ObjectId(anomaly_id)},
        {"$set": {
            "status": "resolved",
            "resolved_at": datetime.utcnow(),
            "resolution_notes": resolve.resolution_notes
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    
    updated = await db[ANOMALIES].find_one({"_id": ObjectId(anomaly_id)})
    return serialize_anomaly(updated)


@router.delete("/{anomaly_id}")
async def delete_anomaly(anomaly_id: str):
    """Delete an anomaly."""
    db = get_database()
    
    result = await db[ANOMALIES].delete_one({"_id": ObjectId(anomaly_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    
    return {"message": "Anomaly deleted"}
