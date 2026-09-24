"""
One-time migration script to fix column widths in the Neon database.
Run this once: python fix_column_widths.py

The SQLAlchemy models define department and batch as String(100),
but the database table was created with VARCHAR(20). This script
alters the columns to match the model definitions.
"""
import asyncio
import logging
from sqlalchemy import text
from database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Columns that need their VARCHAR width increased
ALTER_STATEMENTS = [
    # Users table — expand narrow columns to match model definitions
    "ALTER TABLE users ALTER COLUMN department TYPE VARCHAR(100);",
    "ALTER TABLE users ALTER COLUMN batch TYPE VARCHAR(100);",
    "ALTER TABLE users ALTER COLUMN roll_number TYPE VARCHAR(50);",
    "ALTER TABLE users ALTER COLUMN placement_status TYPE VARCHAR(30);",
]


async def run_migration():
    logger.info("Starting column width migration...")
    async with engine.begin() as conn:
        for stmt in ALTER_STATEMENTS:
            try:
                await conn.execute(text(stmt))
                logger.info(f"  ✓ {stmt}")
            except Exception as e:
                logger.warning(f"  ✗ {stmt} — {e}")
    logger.info("Migration complete!")


if __name__ == "__main__":
    asyncio.run(run_migration())
