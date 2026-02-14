import logging

from fastapi import APIRouter

from app.services.cache_service import ping_redis
from app.utils.supabase_client import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    redis_ok = await ping_redis()

    supabase_ok = False
    try:
        sb = get_supabase()
        sb.table("users").select("id").limit(1).execute()
        supabase_ok = True
    except Exception as e:
        logger.warning("Supabase health check failed: %s", e)

    return {
        "status": "ok" if (redis_ok and supabase_ok) else "degraded",
        "redis": "ok" if redis_ok else "error",
        "supabase": "ok" if supabase_ok else "error",
    }
