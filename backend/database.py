import logging
import asyncio
import socket
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from config import settings
from models.base import Base
import models  # import all models so metadata knows about them

logger = logging.getLogger(__name__)

SQLITE_FALLBACK_URL = "sqlite+aiosqlite:///./kollab_local.db"


def _normalize_pg_url(db_url: str) -> str:
    """Convert postgres:// or postgresql:// to postgresql+asyncpg:// and clean params."""
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    if "asyncpg" in db_url:
        db_url = db_url.replace("sslmode=require", "ssl=require")
        db_url = (
            db_url
            .replace("&channel_binding=require", "")
            .replace("channel_binding=require&", "")
            .replace("channel_binding=require", "")
        )
    return db_url


def _is_neon_reachable(db_url: str, timeout: float = 3.0) -> bool:
    """Quick TCP probe to check if the Neon host:5432 is reachable."""
    try:
        # Extract host from URL: postgresql+asyncpg://user:pass@host:port/db
        after_at = db_url.split("@", 1)[1]  # "host:port/db?..."
        host_port = after_at.split("/")[0]   # "host:port" or "host"
        host = host_port.split(":")[0]
        port = int(host_port.split(":")[1]) if ":" in host_port else 5432

        sock = socket.create_connection((host, port), timeout=timeout)
        sock.close()
        return True
    except Exception as e:
        logger.warning(f"Neon TCP probe failed ({e}). Falling back to local SQLite.")
        return False


def _build_engine(db_url: str):
    """Build an async engine with correct settings for the given URL."""
    is_sqlite = db_url.startswith("sqlite")
    is_neon = "neon.tech" in db_url or "pooler" in db_url

    engine_kwargs = {}
    pool_kwargs = {}

    if is_sqlite:
        engine_kwargs["connect_args"] = {"check_same_thread": False}
        pool_kwargs["pool_pre_ping"] = True
    elif "asyncpg" in db_url:
        # Neon/pgbouncer poolers don't support prepared statements
        engine_kwargs["connect_args"] = {"statement_cache_size": 0}
        if is_neon:
            pool_kwargs["poolclass"] = NullPool
            logger.info("Using NullPool for Neon connection (external pooler detected).")
        else:
            pool_kwargs["pool_pre_ping"] = True
            pool_kwargs["pool_recycle"] = 300

    return create_async_engine(
        db_url,
        echo=False,
        future=True,
        **pool_kwargs,
        **engine_kwargs,
    )


# ─── Choose the right DB ──────────────────────────────────────────────────────
_raw_url = settings.DATABASE_URL or ""
_is_pg = _raw_url.startswith("postgresql") or _raw_url.startswith("postgres://")

if _is_pg:
    _pg_url = _normalize_pg_url(_raw_url)
    if _is_neon_reachable(_pg_url):
        logger.info("✅ Neon PostgreSQL is reachable. Using cloud database.")
        ACTIVE_DB_URL = _pg_url
        _using_sqlite = False
    else:
        logger.warning("⚠️  Neon unreachable — starting with local SQLite fallback.")
        ACTIVE_DB_URL = SQLITE_FALLBACK_URL
        _using_sqlite = True
else:
    # Already SQLite or other local DB
    ACTIVE_DB_URL = _raw_url if _raw_url else SQLITE_FALLBACK_URL
    _using_sqlite = True

engine = _build_engine(ACTIVE_DB_URL)

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
    db_type = "SQLite (local fallback)" if _using_sqlite else "Neon PostgreSQL"
    logger.info(f"Database schema initialised successfully [{db_type}].")
