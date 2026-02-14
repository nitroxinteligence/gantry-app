import logging

from fastapi import APIRouter, Depends, HTTPException

from app.services.briefing_service import generate_user_briefing, get_briefing_status
from app.utils.jwt_auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/briefing", tags=["briefing"])


@router.get("")
async def get_briefing(user_id: str = Depends(get_current_user)):
    try:
        result = await generate_user_briefing(user_id)
        return result
    except Exception as e:
        logger.error("Erro ao gerar briefing: %s", e)
        raise HTTPException(status_code=500, detail="Erro ao gerar briefing")


@router.get("/status")
async def briefing_status(user_id: str = Depends(get_current_user)):
    try:
        return await get_briefing_status(user_id)
    except Exception as e:
        logger.error("Erro ao verificar briefing: %s", e)
        raise HTTPException(status_code=500, detail="Erro ao verificar briefing")
