import json
import logging

import redis.asyncio as redis

from app.config import settings

logger = logging.getLogger(__name__)

_pool: redis.ConnectionPool | None = None


def _get_pool() -> redis.ConnectionPool:
    global _pool
    if _pool is None:
        _pool = redis.ConnectionPool.from_url(
            settings.redis_url,
            decode_responses=True,
        )
    return _pool


def get_redis() -> redis.Redis:
    return redis.Redis(connection_pool=_get_pool())


async def get_cached_context(user_id: str) -> dict | None:
    r = get_redis()
    try:
        data = await r.get(f"context:{user_id}")
        if data:
            return json.loads(data)
    except Exception as e:
        logger.warning("Redis get error: %s", e)
    return None


async def set_cached_context(user_id: str, context: dict) -> None:
    r = get_redis()
    try:
        await r.set(
            f"context:{user_id}",
            json.dumps(context, default=str),
            ex=settings.context_cache_ttl,
        )
    except Exception as e:
        logger.warning("Redis set error: %s", e)


async def invalidate_context(user_id: str) -> None:
    r = get_redis()
    try:
        await r.delete(f"context:{user_id}")
    except Exception as e:
        logger.warning("Redis delete error: %s", e)


async def check_rate_limit(user_id: str) -> bool:
    r = get_redis()
    key = f"rate:{user_id}"
    try:
        count = await r.incr(key)
        if count == 1:
            await r.expire(key, 60)
        return count <= settings.rate_limit_per_minute
    except Exception as e:
        logger.warning("Redis rate limit error: %s", e)
        return True


async def ping_redis() -> bool:
    r = get_redis()
    try:
        return await r.ping()
    except Exception:
        return False
