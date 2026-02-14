import logging
from datetime import datetime, timezone

from google.genai import types

from app.utils.supabase_client import get_supabase

logger = logging.getLogger(__name__)


async def save_message(
    conversa_id: str,
    autor: str,
    conteudo: str,
    metadata: dict | None = None,
) -> None:
    sb = get_supabase()
    sb.table("mensagens").insert({
        "conversa_id": conversa_id,
        "autor": autor,
        "conteudo": conteudo,
        "metadata": metadata or {},
    }).execute()


async def update_ultima_mensagem(conversa_id: str, mensagem: str) -> None:
    sb = get_supabase()
    preview = mensagem[:100] if len(mensagem) > 100 else mensagem
    sb.table("conversas").update({
        "ultima_mensagem": preview,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", conversa_id).execute()


async def load_historico(conversa_id: str, limit: int = 100) -> list[types.Content]:
    sb = get_supabase()
    res = (
        sb.table("mensagens")
        .select("autor, conteudo")
        .eq("conversa_id", conversa_id)
        .order("created_at", desc=False)
        .limit(limit)
        .execute()
    )

    contents: list[types.Content] = []
    for msg in (res.data or []):
        role = "user" if msg["autor"] == "usuario" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg["conteudo"])],
            )
        )

    return contents
