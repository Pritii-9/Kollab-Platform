import json
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from config import settings
from models.base import Base
import models  # import all models so metadata knows about them

logger = logging.getLogger(__name__)

# Normalize Database URL for Async SQLAlchemy
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Clean query params for asyncpg (e.g. sslmode -> ssl, remove channel_binding)
if "asyncpg" in db_url:
    db_url = db_url.replace("sslmode=require", "ssl=require")
    if "channel_binding=require" in db_url:
        db_url = db_url.replace("&channel_binding=require", "").replace("channel_binding=require&", "").replace("channel_binding=require", "")

engine_kwargs = {}
if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
elif "asyncpg" in db_url:
    # Neon and pgbouncer poolers require statement_cache_size=0
    engine_kwargs["connect_args"] = {"statement_cache_size": 0}

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_recycle=300,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized.")

    # Run seed data loader
    from utils.seed import seed_database
    async with AsyncSessionLocal() as session:
        await seed_database(session)
