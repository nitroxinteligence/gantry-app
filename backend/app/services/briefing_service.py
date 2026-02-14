import logging
from datetime import datetime, timezone

from app.services.context_builder import build_contexto_usuario
from app.services.gemini_client import generate_briefing
from app.services.system_prompt import build_morning_briefing_prompt
from app.utils.supabase_client import get_supabase

logger = logging.getLogger(__name__)


async def generate_user_briefing(user_id: str) -> dict:
    contexto = await build_contexto_usuario(user_id)
    prompt = build_morning_briefing_prompt(contexto)
    conteudo = await generate_briefing(prompt)

    sb = get_supabase()
    res = sb.table("briefings").insert({
        "user_id": user_id,
        "conteudo": conteudo,
        "gerado_em": datetime.now(timezone.utc).isoformat(),
    }).execute()

    briefing_id = res.data[0]["id"] if res.data else None

    return {
        "conteudo": conteudo,
        "briefing_id": briefing_id,
    }


async def get_briefing_status(user_id: str) -> dict:
    sb = get_supabase()
    hoje = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    res = (
        sb.table("briefings")
        .select("id, conteudo, gerado_em")
        .eq("user_id", user_id)
        .gte("gerado_em", f"{hoje}T00:00:00")
        .order("gerado_em", desc=True)
        .limit(1)
        .execute()
    )

    if res.data:
        b = res.data[0]
        return {
            "pendente": True,
            "briefing_id": b["id"],
            "conteudo": b["conteudo"],
            "gerado_em": b["gerado_em"],
        }

    return {"pendente": False}


async def check_and_generate_briefings() -> None:
    sb = get_supabase()
    agora = datetime.now(timezone.utc)
    hora_atual = agora.strftime("%H:%M")

    schedules_res = (
        sb.table("briefing_schedule")
        .select("user_id, hora_preferida")
        .eq("ativo", True)
        .execute()
    )

    for schedule in (schedules_res.data or []):
        hora_preferida = schedule.get("hora_preferida", "")
        if not hora_preferida:
            continue

        hora_pref = hora_preferida[:5]
        if hora_pref != hora_atual:
            continue

        user_id = schedule["user_id"]
        hoje = agora.strftime("%Y-%m-%d")
        existing = (
            sb.table("briefings")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("gerado_em", f"{hoje}T00:00:00")
            .execute()
        )

        if existing.count and existing.count > 0:
            continue

        try:
            await generate_user_briefing(user_id)
            logger.info("Briefing gerado para user %s", user_id)
        except Exception as e:
            logger.error("Erro ao gerar briefing para user %s: %s", user_id, e)
