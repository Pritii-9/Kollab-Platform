import time
import logging
import json
from typing import Optional, Any
from config import settings

logger = logging.getLogger(__name__)

# Redis Client Instance (Lazy initialized)
_redis_client = None
_redis_attempted = False

# Fallback In-Memory Cache Store
_memory_cache = {}  # key -> (value, expiry_timestamp)
_memory_rate_limit = {}  # key -> list of timestamps

async def get_redis():
    global _redis_client, _redis_attempted
    if _redis_attempted:
        return _redis_client

    _redis_attempted = True
    if settings.REDIS_URL:
        try:
            import redis.asyncio as aioredis
            _redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await _redis_client.ping()
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis ({e}). Falling back to in-memory cache.")
            _redis_client = None
    return _redis_client


class CacheService:
    @staticmethod
    async def get(key: str) -> Optional[Any]:
        r = await get_redis()
        if r:
            try:
                val = await r.get(key)
                return json.loads(val) if val else None
            except Exception as e:
                logger.warning(f"Redis GET failed for {key}: {e}")

        # Fallback to in-memory cache
        if key in _memory_cache:
            val, exp = _memory_cache[key]
            if time.time() < exp:
                return val
            del _memory_cache[key]
        return None

    @staticmethod
    async def set(key: str, value: Any, ttl: int = 3600):
        r = await get_redis()
        if r:
            try:
                await r.set(key, json.dumps(value), ex=ttl)
                return
            except Exception as e:
                logger.warning(f"Redis SET failed for {key}: {e}")

        # Fallback to in-memory cache
        _memory_cache[key] = (value, time.time() + ttl)

    @staticmethod
    async def is_rate_limited(ip: str, path: str, max_requests: int = 5, window_seconds: int = 60) -> bool:
        if ip in ("testclient", "testserver"):
            return False

        rate_key = f"rate_limit:{ip}:{path}"
        r = await get_redis()
        if r:
            try:
                current = await r.incr(rate_key)
                if current == 1:
                    await r.expire(rate_key, window_seconds)
                return current > max_requests
            except Exception as e:
                logger.warning(f"Redis RateLimit failed for {ip}: {e}")

        # Fallback to in-memory sliding window
        now = time.time()
        cutoff = now - window_seconds
        timestamps = _memory_rate_limit.get(rate_key, [])
        timestamps = [t for t in timestamps if t > cutoff]

        if len(timestamps) >= max_requests:
            return True

        timestamps.append(now)
        _memory_rate_limit[rate_key] = timestamps
        return False
