"""Flush Neon's stale prepared statement cache after ALTER TABLE."""
import asyncio
import asyncpg

async def flush_cache():
    conn = await asyncpg.connect(
        "postgresql://neondb_owner:npg_P84sMkoDOGcR@ep-square-rain-b5s2o83x-pooler.c-7.us-east-2.aws.neon.tech/neondb",
        ssl="require",
        statement_cache_size=0,
    )
    try:
        await conn.execute("DISCARD ALL")
        print("[OK] Server-side prepared statement cache flushed")
        result = await conn.fetch("""
            SELECT column_name, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('department', 'batch', 'roll_number', 'placement_status')
            ORDER BY column_name
        """)
        for row in result:
            print(f"  {row['column_name']}: VARCHAR({row['character_maximum_length']})")
    finally:
        await conn.close()

asyncio.run(flush_cache())
