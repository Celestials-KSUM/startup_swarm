import motor.motor_asyncio
from app.core.config import settings

client = None
db = None

async def connect_to_db():
    global client, db
    # Use MONGO_URI from settings or fallback to default
    uri = getattr(settings, "MONGO_URI", "mongodb://localhost:27017/startup_swarm")
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    db = client.get_database("startup_swarm") # Explicitly define the database name
    
    # Send a ping to confirm a successful connection
    try:
        await client.admin.command('ping')
        print(f"Connected to MongoDB: {uri}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

async def close_db_connection():
    global client
    if client:
        client.close()
    print("Closed MongoDB connection.")

async def get_database():
    """FastAPI dependency — yields the async MongoDB database object."""
    if db is None:
        raise RuntimeError("Database not initialized. Is MongoDB running?")
    yield db
