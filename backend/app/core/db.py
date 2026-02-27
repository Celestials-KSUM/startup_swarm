from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import MetaData, Table, Column, Integer, String, DateTime, text
from sqlalchemy.dialects.postgresql import JSONB
import datetime
from app.core.config import settings

# ── Schema Definition ─────────────────────────────────────────────────────────
metadata = MetaData()

chats_table = Table(
    "chats",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("thread_id", String, nullable=True),
    Column("role", String, nullable=False),
    Column("content", String, nullable=False),
    Column("created_at", DateTime, default=datetime.datetime.utcnow),
)

analyses_table = Table(
    "analyses",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("thread_id", String, nullable=True),
    Column("type", String, nullable=False),
    Column("data", JSONB, nullable=True),
    Column("created_at", DateTime, default=datetime.datetime.utcnow),
)

# ── Engine & Session Factory ──────────────────────────────────────────────────
engine = None
AsyncSessionLocal = None


async def connect_to_db():
    global engine, AsyncSessionLocal
    engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
    AsyncSessionLocal = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    # Auto-create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(metadata.create_all)
    print(f"Connected to PostgreSQL: {settings.DATABASE_URL}")


async def close_db_connection():
    global engine
    if engine:
        await engine.dispose()
    print("Closed PostgreSQL connection.")


async def get_database():
    """FastAPI dependency — yields an AsyncSession per request."""
    if AsyncSessionLocal is None:
        raise RuntimeError("Database not initialized. Is PostgreSQL running?")
    async with AsyncSessionLocal() as session:
        yield session
