"""Team member router."""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import List

from app.models.team import TeamMember, TeamMemberCreate, TeamMemberUpdate
from app.database.connection import get_database
from app.database.collections import TEAM_MEMBERS

router = APIRouter(prefix="/api/team", tags=["Team"])


def serialize_team_member(doc: dict) -> dict:
    """Convert MongoDB document to TeamMember."""
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "role": doc["role"],
        "department": doc["department"],
        "status": doc.get("status", "active"),
        "performance_score": doc.get("performance_score", 0),
        "tickets_resolved": doc.get("tickets_resolved", 0),
        "avatar": doc.get("avatar"),
        "created_at": doc["created_at"],
        "updated_at": doc.get("updated_at")
    }


@router.get("", response_model=List[TeamMember])
async def get_team_members(department: str = None, status: str = None):
    """Get all team members with optional filters."""
    db = get_database()
    
    # Fallback data when database is offline
    if db is None:
        return [
            {
                "id": "1",
                "name": "Raj Sharma",
                "email": "raj@optimsp.com",
                "role": "Senior Engineer",
                "department": "Technical",
                "status": "active",
                "performance_score": 92,
                "tickets_resolved": 45,
                "avatar": None,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": None
            }
        ]
    
    query = {}
    if department:
        query["department"] = department
    if status:
        query["status"] = status
    
    cursor = db[TEAM_MEMBERS].find(query)
    members = await cursor.to_list(100)
    
    return [serialize_team_member(m) for m in members]


@router.post("", response_model=TeamMember)
async def create_team_member(member: TeamMemberCreate):
    """Create a new team member."""
    db = get_database()
    
    # Check if email exists
    existing = await db[TEAM_MEMBERS].find_one({"email": member.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    member_dict = member.model_dump()
    member_dict["created_at"] = datetime.utcnow()
    
    result = await db[TEAM_MEMBERS].insert_one(member_dict)
    
    created = await db[TEAM_MEMBERS].find_one({"_id": result.inserted_id})
    return serialize_team_member(created)


@router.get("/{member_id}", response_model=TeamMember)
async def get_team_member(member_id: str):
    """Get a specific team member."""
    db = get_database()
    
    member = await db[TEAM_MEMBERS].find_one({"_id": ObjectId(member_id)})
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    return serialize_team_member(member)


@router.put("/{member_id}", response_model=TeamMember)
async def update_team_member(member_id: str, update: TeamMemberUpdate):
    """Update a team member."""
    db = get_database()
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db[TEAM_MEMBERS].update_one(
        {"_id": ObjectId(member_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    updated = await db[TEAM_MEMBERS].find_one({"_id": ObjectId(member_id)})
    return serialize_team_member(updated)


@router.delete("/{member_id}")
async def delete_team_member(member_id: str):
    """Delete a team member."""
    db = get_database()
    
    result = await db[TEAM_MEMBERS].delete_one({"_id": ObjectId(member_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    return {"message": "Team member deleted"}
