from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None


async def connect_to_mongodb():
    global client, database
    try:
        client = AsyncIOMotorClient(settings.mongodb_url)
        database = client[settings.mongodb_database]
        # Test the connection
        await client.admin.command('ping')
        print(f"Connected to MongoDB: {settings.mongodb_database}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        print("Running in offline mode - some features may not work")
        client = None
        database = None


async def close_mongodb_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        print("Warning: Database not connected. Some features may not work.")
    return database
