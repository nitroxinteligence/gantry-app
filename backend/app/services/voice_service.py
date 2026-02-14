import logging

from app.services.gemini_client import transcribe_audio

logger = logging.getLogger(__name__)


async def transcribe_voice(audio_bytes: bytes, mime_type: str) -> str:
    if not audio_bytes:
        raise ValueError("Audio vazio")

    if not mime_type:
        mime_type = "audio/webm"

    texto = await transcribe_audio(audio_bytes, mime_type)

    if not texto:
        raise ValueError("Nao foi possivel transcrever o audio")

    return texto.strip()
