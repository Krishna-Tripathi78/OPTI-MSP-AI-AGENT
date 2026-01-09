"""
MongoDB Seed Script - Populates database with initial MSP data.
Run this script after setting up MongoDB to populate initial data.

Usage:
    cd backend
    python seed_database.py
"""
import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from app.config import get_settings

settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ===================== USERS DATA =====================
USERS_DATA = [
    {
        "email": "admin@optimsp.com",
        "name": "Admin User",
        "company": "OptiMSP",
        "password": "Admin@123",  # Will be hashed
        "phone": "+1 (555) 123-4567",
        "role": "admin",
        "is_active": True
    },
    {
        "email": "demo@optimsp.com",
        "name": "Demo User",
        "company": "Demo Company",
        "password": "Demo123",
        "phone": "+1 (555) 987-6543",
        "role": "user",
        "is_active": True
    }
]


# ===================== CLIENTS DATA =====================
# ... (Clients data remains mapping logic below) ...




# ===================== CLIENTS DATA =====================
CLIENTS_DATA = [
    {
        "name": "Sharma Technologies",
        "industry": "Technology",
        "contact_email": "contact@sharmatech.com",
        "monthly_revenue": 25000,
        "monthly_cost": 17000,
        "health_score": 92,
        "status": "active",
        "services": [
            {"name": "Managed IT Services", "monthly_cost": 8000, "status": "active"},
            {"name": "Cloud Services", "monthly_cost": 5000, "status": "active"},
            {"name": "Cybersecurity", "monthly_cost": 4000, "status": "active"}
        ]
    },
    {
        "name": "Patel Manufacturing",
        "industry": "Manufacturing",
        "contact_email": "it@patelmanufacturing.com",
        "monthly_revenue": 18000,
        "monthly_cost": 14500,
        "health_score": 78,
        "status": "active",
        "services": [
            {"name": "Managed IT Services", "monthly_cost": 9000, "status": "active"},
            {"name": "Backup & Recovery", "monthly_cost": 3500, "status": "active"},
            {"name": "Help Desk Support", "monthly_cost": 2000, "status": "active"}
        ]
    },
    {
        "name": "Gupta Innovations",
        "industry": "Technology",
        "contact_email": "tech@guptainnovations.com",
        "monthly_revenue": 12000,
        "monthly_cost": 13200,
        "health_score": 45,
        "status": "active",
        "services": [
            {"name": "Cloud Services", "monthly_cost": 8000, "status": "active"},
            {"name": "Cybersecurity", "monthly_cost": 5200, "status": "active"}
        ]
    },
    {
        "name": "Agarwal Enterprises",
        "industry": "Retail",
        "contact_email": "admin@agarwalent.com",
        "monthly_revenue": 45000,
        "monthly_cost": 28000,
        "health_score": 95,
        "status": "active",
        "services": [
            {"name": "Managed IT Services", "monthly_cost": 12000, "status": "active"},
            {"name": "Cloud Services", "monthly_cost": 8000, "status": "active"},
            {"name": "Cybersecurity", "monthly_cost": 5000, "status": "active"},
            {"name": "Backup & Recovery", "monthly_cost": 3000, "status": "active"}
        ]
    },
    {
        "name": "Singh Retail Chain",
        "industry": "Retail",
        "contact_email": "it@singhretail.com",
        "monthly_revenue": 8000,
        "monthly_cost": 6500,
        "health_score": 72,
        "status": "active",
        "services": [
            {"name": "Help Desk Support", "monthly_cost": 4000, "status": "active"},
            {"name": "Backup & Recovery", "monthly_cost": 2500, "status": "active"}
        ]
    },
    {
        "name": "Mehta Healthcare",
        "industry": "Healthcare",
        "contact_email": "admin@mehtahealthcare.com",
        "monthly_revenue": 32000,
        "monthly_cost": 22000,
        "health_score": 88,
        "status": "active",
        "services": [
            {"name": "Managed IT Services", "monthly_cost": 10000, "status": "active"},
            {"name": "Cybersecurity", "monthly_cost": 7000, "status": "active"},
            {"name": "Backup & Recovery", "monthly_cost": 5000, "status": "active"}
        ]
    },
    {
        "name": "Jain Legal Associates",
        "industry": "Legal",
        "contact_email": "it@jainlegal.com",
        "monthly_revenue": 15000,
        "monthly_cost": 11000,
        "health_score": 82,
        "status": "active",
        "services": [
            {"name": "Managed IT Services", "monthly_cost": 6000, "status": "active"},
            {"name": "Cybersecurity", "monthly_cost": 3000, "status": "active"},
            {"name": "Backup & Recovery", "monthly_cost": 2000, "status": "active"}
        ]
    },
    {
        "name": "Kumar Construction",
        "industry": "Construction",
        "contact_email": "office@kumarconstruction.com",
        "monthly_revenue": 22000,
        "monthly_cost": 18500,
        "health_score": 68,
        "status": "active",
        "services": [
            {"name": "Managed IT Services", "monthly_cost": 8000, "status": "active"},
            {"name": "Cloud Services", "monthly_cost": 6000, "status": "active"},
            {"name": "Help Desk Support", "monthly_cost": 4500, "status": "active"}
        ]
    },
    {
        "name": "Verma Financial Services",
        "industry": "Finance",
        "contact_email": "tech@vermafinance.com",
        "monthly_revenue": 38000,
        "monthly_cost": 25000,
        "health_score": 94,
        "status": "active",
        "services": [
            {"name": "Managed IT Services", "monthly_cost": 10000, "status": "active"},
            {"name": "Cybersecurity", "monthly_cost": 8000, "status": "active"},
            {"name": "Cloud Services", "monthly_cost": 4000, "status": "active"},
            {"name": "Backup & Recovery", "monthly_cost": 3000, "status": "active"}
        ]
    },
    {
        "name": "Bansal Education Group",
        "industry": "Education",
        "contact_email": "it@bansaleducation.com",
        "monthly_revenue": 28000,
        "monthly_cost": 21000,
        "health_score": 85,
        "status": "active",
        "services": [
            {"name": "Managed IT Services", "monthly_cost": 9000, "status": "active"},
            {"name": "Cloud Services", "monthly_cost": 7000, "status": "active"},
            {"name": "Help Desk Support", "monthly_cost": 5000, "status": "active"}
        ]
    }
]


# ===================== TEAM MEMBERS DATA =====================
TEAM_MEMBERS_DATA = [
    {
        "name": "Rajesh Sharma",
        "email": "rajesh.sharma@optimsp.com",
        "role": "Senior Engineer",
        "department": "Technical",
        "status": "active",
        "performance_score": 94,
        "tickets_resolved": 127,
        "avatar": None
    },
    {
        "name": "Priya Patel",
        "email": "priya.patel@optimsp.com",
        "role": "Project Manager",
        "department": "Operations",
        "status": "active",
        "performance_score": 91,
        "tickets_resolved": 89,
        "avatar": None
    },
    {
        "name": "Amit Kumar",
        "email": "amit.kumar@optimsp.com",
        "role": "Cloud Architect",
        "department": "Technical",
        "status": "active",
        "performance_score": 88,
        "tickets_resolved": 156,
        "avatar": None
    },
    {
        "name": "Sneha Gupta",
        "email": "sneha.gupta@optimsp.com",
        "role": "Security Analyst",
        "department": "Security",
        "status": "active",
        "performance_score": 96,
        "tickets_resolved": 98,
        "avatar": None
    },
    {
        "name": "Vikram Singh",
        "email": "vikram.singh@optimsp.com",
        "role": "Support Specialist",
        "department": "Support",
        "status": "active",
        "performance_score": 82,
        "tickets_resolved": 203,
        "avatar": None
    },
    {
        "name": "Kavya Mehta",
        "email": "kavya.mehta@optimsp.com",
        "role": "Network Admin",
        "department": "Technical",
        "status": "active",
        "performance_score": 90,
        "tickets_resolved": 134,
        "avatar": None
    }
]


# ===================== ANOMALIES DATA =====================
ANOMALIES_DATA = [
    {
        "title": "Unusual Spike in AWS Costs",
        "description": "AWS costs increased by 127% compared to the monthly average. EC2 instances were left running over the weekend.",
        "severity": "high",
        "category": "Cost",
        "client_name": "Sharma Technologies",
        "impact_amount": 12400,
        "status": "open"
    },
    {
        "title": "Abnormal License Usage",
        "description": "Microsoft 365 licenses showing only 45% utilization. 22 licenses appear to be unused.",
        "severity": "medium",
        "category": "License",
        "client_name": "Patel Manufacturing",
        "impact_amount": 8200,
        "status": "open"
    },
    {
        "title": "Storage Capacity Warning",
        "description": "Backup storage approaching 90% capacity. Additional storage may be required within 30 days.",
        "severity": "medium",
        "category": "Infrastructure",
        "client_name": "Mehta Healthcare",
        "impact_amount": 5000,
        "status": "investigating"
    },
    {
        "title": "Security Certificate Expiring",
        "description": "SSL certificate for client portal expiring in 15 days. Renewal required to prevent service disruption.",
        "severity": "high",
        "category": "Security",
        "client_name": "Verma Financial Services",
        "impact_amount": 0,
        "status": "open"
    },
    {
        "title": "Duplicate Software Subscriptions",
        "description": "Found 15 duplicate Zoom subscriptions across departments. Consolidation recommended.",
        "severity": "low",
        "category": "License",
        "client_name": "Bansal Education Group",
        "impact_amount": 6080,
        "status": "open"
    }
]


# ===================== SEED FUNCTION =====================
async def seed_database():
    """Seed the MongoDB database with initial data."""
    print("🌱 Starting database seed...")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_database]
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    print("🗑️  Clearing existing data...")
    await db.users.delete_many({})
    await db.clients.delete_many({})
    await db.team_members.delete_many({})
    await db.anomalies.delete_many({})
    
    # Seed Users
    print("👤 Seeding users...")
    for user_data in USERS_DATA:
        user_doc = {
            "email": user_data["email"],
            "name": user_data["name"],
            "company": user_data.get("company"),
            "phone": user_data.get("phone"),
            "role": user_data.get("role", "user"),
            "hashed_password": pwd_context.hash(user_data["password"]),
            "is_active": user_data.get("is_active", True),
            "created_at": datetime.utcnow()
        }
        await db.users.insert_one(user_doc)
    print(f"   ✅ Inserted {len(USERS_DATA)} users")
    print("      📧 admin@optimsp.com / Admin123")
    print("      📧 demo@optimsp.com / Demo123")
    
    # Seed Clients
    print("📊 Seeding clients...")
    for client_data in CLIENTS_DATA:
        client_data["created_at"] = datetime.utcnow()
        await db.clients.insert_one(client_data)
    print(f"   ✅ Inserted {len(CLIENTS_DATA)} clients")
    
    # Seed Team Members
    print("👥 Seeding team members...")
    for member_data in TEAM_MEMBERS_DATA:
        member_data["created_at"] = datetime.utcnow()
        await db.team_members.insert_one(member_data)
    print(f"   ✅ Inserted {len(TEAM_MEMBERS_DATA)} team members")
    
    # Seed Anomalies
    print("🚨 Seeding anomalies...")
    for anomaly_data in ANOMALIES_DATA:
        anomaly_data["detected_at"] = datetime.utcnow() - timedelta(hours=anomaly_data.get("hours_ago", 2))
        await db.anomalies.insert_one(anomaly_data)
    print(f"   ✅ Inserted {len(ANOMALIES_DATA)} anomalies")
    
    # Close connection
    client.close()
    
    print("\n🎉 Database seeding complete!")
    print(f"   Database: {settings.mongodb_database}")
    print(f"   Users: {len(USERS_DATA)}")
    print(f"   Clients: {len(CLIENTS_DATA)}")
    print(f"   Team Members: {len(TEAM_MEMBERS_DATA)}")
    print(f"   Anomalies: {len(ANOMALIES_DATA)}")


if __name__ == "__main__":
    asyncio.run(seed_database())
