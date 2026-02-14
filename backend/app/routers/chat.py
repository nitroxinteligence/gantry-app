import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from google.genai import types
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import ChatRequest
from app.services.action_executor import executar_funcao
from app.services.cache_service import check_rate_limit, invalidate_context
from app.services.context_builder import build_contexto_usuario
from app.services.conversation_service import (
    load_historico,
    save_message,
    update_ultima_mensagem,
)
from app.services.gemini_client import generate_with_function_response, stream_chat
from app.services.system_prompt import build_system_prompt
from app.utils.jwt_auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    user_id: str = Depends(get_current_user),
):
    allowed = await check_rate_limit(user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail="Rate limit excedido. Aguarde 1 minuto.")

    return EventSourceResponse(
        _stream_response(user_id, request),
        media_type="text/event-stream",
    )


async def _stream_response(user_id: str, request: ChatRequest):
    try:
        await save_message(request.conversa_id, "usuario", request.mensagem)

        contexto = await build_contexto_usuario(user_id)
        system_instruction = build_system_prompt(contexto)

        historico = await load_historico(request.conversa_id)

        resposta_completa = ""
        houve_crud = False

        async for chunk in stream_chat(historico, request.mensagem, system_instruction):
            if chunk["tipo"] == "funcao":
                nome = chunk["nome"]
                args = chunk["args"]

                resultado = await executar_funcao(user_id, nome, args)
                houve_crud = True

                emoji = "✅" if resultado.sucesso else "❌"
                acao_texto = f"{emoji} {resultado.mensagem}"
                resposta_completa += f"\n{acao_texto}\n"

                yield {
                    "data": json.dumps({
                        "tipo": "acao",
                        "conteudo": acao_texto,
                        "resultado": resultado.to_dict(),
                    }, ensure_ascii=False),
                }

                function_call_content = types.Content(
                    role="model",
                    parts=[types.Part.from_function_call(
                        name=nome,
                        args=args,
                    )],
                )
                function_response_content = types.Content(
                    role="tool",
                    parts=[types.Part.from_function_response(
                        name=nome,
                        response={"result": resultado.to_dict()},
                    )],
                )

                full_history = [
                    *historico,
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=request.mensagem)],
                    ),
                ]

                async for follow_chunk in generate_with_function_response(
                    full_history,
                    function_call_content,
                    function_response_content,
                    system_instruction,
                ):
                    if follow_chunk["tipo"] == "texto":
                        texto = follow_chunk["conteudo"]
                        resposta_completa += texto
                        yield {
                            "data": json.dumps({
                                "tipo": "texto",
                                "conteudo": texto,
                            }, ensure_ascii=False),
                        }

            elif chunk["tipo"] == "texto":
                texto = chunk["conteudo"]
                resposta_completa += texto
                yield {
                    "data": json.dumps({
                        "tipo": "texto",
                        "conteudo": texto,
                    }, ensure_ascii=False),
                }

        if resposta_completa.strip():
            await save_message(
                request.conversa_id,
                "assistente",
                resposta_completa.strip(),
            )
            await update_ultima_mensagem(
                request.conversa_id,
                resposta_completa.strip(),
            )

        if houve_crud:
            await invalidate_context(user_id)

        yield {"data": "[DONE]"}

    except Exception as e:
        logger.error("Erro no chat stream: %s", e)
        yield {
            "data": json.dumps({
                "tipo": "erro",
                "conteudo": f"Erro interno: {e}",
            }, ensure_ascii=False),
        }
        yield {"data": "[DONE]"}
