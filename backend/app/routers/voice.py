import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.services.voice_service import transcribe_voice
from app.utils.jwt_auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe")
async def voice_transcribe(
    file: UploadFile = File(...),
    _user_id: str = Depends(get_current_user),
):
    audio_bytes = await file.read()

    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Arquivo muito grande (max 25MB)")

    mime_type = file.content_type or "audio/webm"

    try:
        texto = await transcribe_voice(audio_bytes, mime_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Erro na transcricao: %s", e)
        raise HTTPException(status_code=500, detail="Erro ao transcrever audio")

    return {"texto": texto}
