import logging
from collections.abc import AsyncGenerator

from google import genai
from google.genai import types

from app.config import settings
from app.services.gemini_tools import tool

logger = logging.getLogger(__name__)

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


async def stream_chat(
    historico: list[types.Content],
    mensagem_usuario: str,
    system_instruction: str,
) -> AsyncGenerator[dict, None]:
    client = get_client()

    contents = [
        *historico,
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=mensagem_usuario)],
        ),
    ]

    response = await client.aio.models.generate_content_stream(
        model=settings.gemini_model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[tool],
        ),
    )

    async for chunk in response:
        if chunk.function_calls:
            for call in chunk.function_calls:
                yield {
                    "tipo": "funcao",
                    "nome": call.name,
                    "args": dict(call.args) if call.args else {},
                }

        if chunk.text:
            yield {"tipo": "texto", "conteudo": chunk.text}


async def generate_with_function_response(
    historico: list[types.Content],
    function_call_content: types.Content,
    function_response_content: types.Content,
    system_instruction: str,
) -> AsyncGenerator[dict, None]:
    client = get_client()

    contents = [
        *historico,
        function_call_content,
        function_response_content,
    ]

    response = await client.aio.models.generate_content_stream(
        model=settings.gemini_model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[tool],
        ),
    )

    async for chunk in response:
        if chunk.function_calls:
            for call in chunk.function_calls:
                yield {
                    "tipo": "funcao",
                    "nome": call.name,
                    "args": dict(call.args) if call.args else {},
                }

        if chunk.text:
            yield {"tipo": "texto", "conteudo": chunk.text}


async def generate_briefing(system_instruction: str) -> str:
    client = get_client()

    response = await client.aio.models.generate_content(
        model=settings.gemini_model,
        contents="Gere o briefing matinal completo para hoje, analisando 100% dos meus dados.",
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
        ),
    )

    return response.text or "Nao foi possivel gerar o briefing."


async def transcribe_audio(audio_bytes: bytes, mime_type: str) -> str:
    client = get_client()

    response = await client.aio.models.generate_content(
        model=settings.gemini_model,
        contents=[
            types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
            "Transcreva este audio em pt-BR com pontuacao correta. Retorne apenas o texto transcrito.",
        ],
    )

    return response.text or ""
