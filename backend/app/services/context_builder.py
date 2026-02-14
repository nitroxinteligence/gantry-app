import asyncio
import logging
from datetime import datetime, timedelta, timezone

from app.models.context import (
    AnalisePerformance,
    ContextoUsuario,
    ResumoCategoriaHabito,
    ResumoCurso,
    ResumoEvento,
    ResumoFoco,
    ResumoHabito,
    ResumoMeta,
    ResumoObjetivo,
    ResumoPendencia,
    ResumoTarefa,
    ResumoUsuario,
)
from app.services.cache_service import get_cached_context, set_cached_context
from app.utils.supabase_client import get_supabase

logger = logging.getLogger(__name__)


def _hoje() -> datetime:
    return datetime.now(timezone.utc)


def _inicio_dia(dt: datetime) -> str:
    return dt.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()


def _fim_dia(dt: datetime) -> str:
    return dt.replace(hour=23, minute=59, second=59, microsecond=999999).isoformat()


def _inicio_semana(dt: datetime) -> str:
    dias_desde_segunda = dt.weekday()
    segunda = dt - timedelta(days=dias_desde_segunda)
    return segunda.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()


def _fim_semana(dt: datetime) -> str:
    dias_ate_domingo = 6 - dt.weekday()
    domingo = dt + timedelta(days=dias_ate_domingo)
    return domingo.replace(hour=23, minute=59, second=59, microsecond=999999).isoformat()


def _query(table: str, select: str, **filters):
    sb = get_supabase()
    q = sb.table(table).select(select)

    for key, val in filters.items():
        if key.startswith("eq_"):
            q = q.eq(key[3:], val)
        elif key.startswith("neq_"):
            q = q.neq(key[4:], val)
        elif key.startswith("gte_"):
            q = q.gte(key[4:], val)
        elif key.startswith("lte_"):
            q = q.lte(key[4:], val)
        elif key == "order":
            col, asc = val
            q = q.order(col, desc=not asc)
        elif key == "limit":
            q = q.limit(val)

    return q.execute()


async def build_contexto_usuario(user_id: str) -> ContextoUsuario:
    cached = await get_cached_context(user_id)
    if cached:
        return ContextoUsuario(**cached)

    contexto = await _build_from_db(user_id)
    await set_cached_context(user_id, contexto.model_dump())
    return contexto


async def _build_from_db(user_id: str) -> ContextoUsuario:
    hoje = _hoje()
    inicio_hoje = _inicio_dia(hoje)
    fim_hoje = _fim_dia(hoje)
    inicio_semana = _inicio_semana(hoje)
    fim_semana = _fim_semana(hoje)
    sete_dias_atras = (hoje - timedelta(days=7)).isoformat()
    hoje_str = hoje.strftime("%Y-%m-%d")
    proximo_7_dias = (hoje + timedelta(days=7)).strftime("%Y-%m-%d")

    sb = get_supabase()

    loop = asyncio.get_event_loop()

    def _fetch_all():
        usuario_res = (
            sb.table("users")
            .select("name, email, level, total_xp, current_streak, longest_streak, streak_shields, avatar_url, created_at")
            .eq("id", user_id)
            .single()
            .execute()
        )

        tarefas_res = (
            sb.table("tasks")
            .select("id, titulo, descricao, prioridade, status, coluna, data_limite, tags, tempo_gasto, xp_recompensa")
            .eq("user_id", user_id)
            .neq("coluna", "concluido")
            .order("prioridade", desc=True)
            .limit(50)
            .execute()
        )

        tarefas_concluidas_res = (
            sb.table("tasks")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("coluna", "concluido")
            .gte("concluida_em", sete_dias_atras)
            .execute()
        )

        pendencias_res = (
            sb.table("pending_items")
            .select("id, titulo, descricao, prioridade, categoria, data_vencimento")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )

        habitos_res = (
            sb.table("habits")
            .select("id, titulo, descricao, streak_atual, maior_streak, frequencia, dias_semana, xp_por_check, category_id")
            .eq("user_id", user_id)
            .eq("ativo", True)
            .limit(30)
            .execute()
        )

        checks_hoje_res = (
            sb.table("habit_checks")
            .select("habit_id")
            .eq("user_id", user_id)
            .eq("check_date", hoje_str)
            .execute()
        )

        categorias_res = (
            sb.table("habit_categories")
            .select("id, titulo, icone, cor")
            .eq("user_id", user_id)
            .order("ordem", desc=False)
            .execute()
        )

        foco_hoje_res = (
            sb.table("focus_sessions")
            .select("duracao_real, xp_ganho")
            .eq("user_id", user_id)
            .eq("status", "completed")
            .gte("created_at", inicio_hoje)
            .lte("created_at", fim_hoje)
            .execute()
        )

        foco_semana_res = (
            sb.table("focus_sessions")
            .select("duracao_real, xp_ganho")
            .eq("user_id", user_id)
            .eq("status", "completed")
            .gte("created_at", inicio_semana)
            .lte("created_at", fim_semana)
            .execute()
        )

        foco_total_res = (
            sb.table("focus_sessions")
            .select("duracao_real, xp_ganho")
            .eq("user_id", user_id)
            .eq("status", "completed")
            .execute()
        )

        metas_res = (
            sb.table("goals")
            .select("id, titulo, descricao, progresso_atual, progresso_total, unidade, status, prazo, xp_recompensa")
            .eq("user_id", user_id)
            .neq("status", "concluido")
            .limit(20)
            .execute()
        )

        metas_concluidas_res = (
            sb.table("goals")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("status", "concluido")
            .execute()
        )

        objetivos_res = (
            sb.table("development_objectives")
            .select("id, titulo, descricao, categoria, progresso_atual, progresso_total, status, habitos_chave, xp_recompensa")
            .eq("user_id", user_id)
            .neq("status", "concluido")
            .limit(20)
            .execute()
        )

        eventos_res = (
            sb.table("events")
            .select("id, titulo, descricao, data, horario_inicio, horario_fim, categoria, local, status")
            .eq("user_id", user_id)
            .gte("data", hoje_str)
            .lte("data", proximo_7_dias)
            .order("data", desc=False)
            .limit(20)
            .execute()
        )

        cursos_res = (
            sb.table("courses")
            .select("id, titulo, descricao, categoria, nivel")
            .eq("status", "publicado")
            .execute()
        )

        progresso_res = (
            sb.table("lesson_progress")
            .select("lesson_id, concluida")
            .eq("user_id", user_id)
            .eq("concluida", True)
            .execute()
        )

        aulas_res = (
            sb.table("lessons")
            .select("id, module_id")
            .execute()
        )

        modulos_res = (
            sb.table("course_modules")
            .select("id, course_id")
            .execute()
        )

        return {
            "usuario": usuario_res,
            "tarefas": tarefas_res,
            "tarefas_concluidas": tarefas_concluidas_res,
            "pendencias": pendencias_res,
            "habitos": habitos_res,
            "checks_hoje": checks_hoje_res,
            "categorias": categorias_res,
            "foco_hoje": foco_hoje_res,
            "foco_semana": foco_semana_res,
            "foco_total": foco_total_res,
            "metas": metas_res,
            "metas_concluidas": metas_concluidas_res,
            "objetivos": objetivos_res,
            "eventos": eventos_res,
            "cursos": cursos_res,
            "progresso": progresso_res,
            "aulas": aulas_res,
            "modulos": modulos_res,
        }

    results = await loop.run_in_executor(None, _fetch_all)

    u = results["usuario"].data or {}
    usuario = ResumoUsuario(
        nome=u.get("name", "Usuario"),
        email=u.get("email", ""),
        nivel=u.get("level", 1),
        xp_total=u.get("total_xp", 0),
        streak_atual=u.get("current_streak", 0),
        maior_streak=u.get("longest_streak", 0),
        streak_shields=u.get("streak_shields", 0),
        avatar_url=u.get("avatar_url"),
        criado_em=u.get("created_at", ""),
    )

    tarefas = [
        ResumoTarefa(
            id=t["id"],
            titulo=t["titulo"],
            descricao=t.get("descricao"),
            prioridade=t["prioridade"],
            status=t["status"],
            coluna=t["coluna"],
            data_limite=t.get("data_limite"),
            tags=t.get("tags") or [],
            tempo_gasto=t.get("tempo_gasto", 0),
            xp_recompensa=t.get("xp_recompensa", 10),
        )
        for t in (results["tarefas"].data or [])
    ]

    pendencias = [
        ResumoPendencia(
            id=p["id"],
            titulo=p["titulo"],
            descricao=p.get("descricao"),
            prioridade=p["prioridade"],
            categoria=p.get("categoria"),
            data_vencimento=p.get("data_vencimento"),
        )
        for p in (results["pendencias"].data or [])
    ]

    checks_hoje_set = {c["habit_id"] for c in (results["checks_hoje"].data or [])}

    habitos_ativos = [
        ResumoHabito(
            id=h["id"],
            titulo=h["titulo"],
            descricao=h.get("descricao"),
            streak_atual=h.get("streak_atual", 0),
            maior_streak=h.get("maior_streak", 0),
            frequencia=h["frequencia"],
            dias_semana=h.get("dias_semana") or [1, 2, 3, 4, 5, 6, 0],
            xp_por_check=h.get("xp_por_check", 15),
            categoria_id=h.get("category_id"),
            concluido_hoje=h["id"] in checks_hoje_set,
        )
        for h in (results["habitos"].data or [])
    ]

    categorias_habito = [
        ResumoCategoriaHabito(
            id=c["id"],
            titulo=c["titulo"],
            icone=c["icone"],
            cor=c["cor"],
        )
        for c in (results["categorias"].data or [])
    ]

    sessoes_dia = results["foco_hoje"].data or []
    sessoes_semana = results["foco_semana"].data or []
    sessoes_total = results["foco_total"].data or []

    total_minutos_foco = round(sum(s.get("duracao_real", 0) for s in sessoes_total) / 60)

    foco_hoje = ResumoFoco(
        sessoes_dia=len(sessoes_dia),
        minutos_dia=round(sum(s.get("duracao_real", 0) for s in sessoes_dia) / 60),
        sessoes_semana=len(sessoes_semana),
        minutos_semana=round(sum(s.get("duracao_real", 0) for s in sessoes_semana) / 60),
        total_sessoes=len(sessoes_total),
        total_minutos=total_minutos_foco,
        media_minutos_por_sessao=round(total_minutos_foco / len(sessoes_total)) if sessoes_total else 0,
        xp_total_foco=sum(s.get("xp_ganho", 0) for s in sessoes_total),
    )

    metas_ativas = [
        ResumoMeta(
            id=m["id"],
            titulo=m["titulo"],
            descricao=m.get("descricao"),
            progresso_atual=m["progresso_atual"],
            progresso_total=m["progresso_total"],
            unidade=m.get("unidade", "unidades"),
            status=m["status"],
            prazo=m.get("prazo"),
            xp_recompensa=m.get("xp_recompensa", 100),
        )
        for m in (results["metas"].data or [])
    ]

    objetivos_desenvolvimento = [
        ResumoObjetivo(
            id=o["id"],
            titulo=o["titulo"],
            descricao=o.get("descricao"),
            categoria=o["categoria"],
            progresso_atual=o["progresso_atual"],
            progresso_total=o["progresso_total"],
            status=o["status"],
            habitos_chave=o.get("habitos_chave") or [],
            xp_recompensa=o.get("xp_recompensa", 50),
        )
        for o in (results["objetivos"].data or [])
    ]

    eventos_proximos = [
        ResumoEvento(
            id=e["id"],
            titulo=e["titulo"],
            descricao=e.get("descricao"),
            data=e["data"],
            horario_inicio=e["horario_inicio"],
            horario_fim=e["horario_fim"],
            categoria=e.get("categoria", "geral"),
            local=e.get("local"),
            status=e.get("status", "confirmado"),
        )
        for e in (results["eventos"].data or [])
    ]

    modulos_data = results["modulos"].data or []
    aulas_data = results["aulas"].data or []
    progresso_data = results["progresso"].data or []

    modulo_to_curso = {m["id"]: m["course_id"] for m in modulos_data}
    aula_to_curso = {a["id"]: modulo_to_curso.get(a["module_id"]) for a in aulas_data}

    aulas_por_curso: dict[str, int] = {}
    for a in aulas_data:
        curso_id = aula_to_curso.get(a["id"])
        if curso_id:
            aulas_por_curso[curso_id] = aulas_por_curso.get(curso_id, 0) + 1

    concluidas_por_curso: dict[str, int] = {}
    for p in progresso_data:
        curso_id = aula_to_curso.get(p["lesson_id"])
        if curso_id:
            concluidas_por_curso[curso_id] = concluidas_por_curso.get(curso_id, 0) + 1

    cursos_em_progresso = []
    for c in (results["cursos"].data or []):
        total_a = aulas_por_curso.get(c["id"], 0)
        concluidas_a = concluidas_por_curso.get(c["id"], 0)
        if concluidas_a > 0 or total_a > 0:
            cursos_em_progresso.append(
                ResumoCurso(
                    id=c["id"],
                    titulo=c["titulo"],
                    descricao=c.get("descricao"),
                    categoria=c.get("categoria", "geral"),
                    nivel=c.get("nivel", "iniciante"),
                    total_aulas=total_a,
                    aulas_concluidas=concluidas_a,
                    progresso_percentual=round((concluidas_a / total_a) * 100, 1) if total_a > 0 else 0,
                )
            )

    habitos_concluidos_hoje = sum(1 for h in habitos_ativos if h.concluido_hoje)
    tarefas_concluidas_recentes = results["tarefas_concluidas"].count or 0
    xp_proximo_nivel = (usuario.nivel ** 2) * 100
    xp_nivel_anterior = ((usuario.nivel - 1) ** 2) * 100
    progresso_nivel = (
        round(((usuario.xp_total - xp_nivel_anterior) / (xp_proximo_nivel - xp_nivel_anterior)) * 100)
        if xp_proximo_nivel > xp_nivel_anterior
        else 0
    )

    total_ativas = len(tarefas)
    analise_performance = AnalisePerformance(
        tarefas_concluidas_ultimos_7_dias=tarefas_concluidas_recentes,
        tarefas_total_ativas=total_ativas,
        taxa_conclusao_tarefas=(
            round((tarefas_concluidas_recentes / (total_ativas + tarefas_concluidas_recentes)) * 100)
            if (total_ativas + tarefas_concluidas_recentes) > 0
            else 0
        ),
        habitos_concluidos_hoje=habitos_concluidos_hoje,
        habitos_total_ativos=len(habitos_ativos),
        taxa_conclusao_habitos=(
            round((habitos_concluidos_hoje / len(habitos_ativos)) * 100) if habitos_ativos else 0
        ),
        foco_minutos_hoje=foco_hoje.minutos_dia,
        foco_minutos_semana=foco_hoje.minutos_semana,
        foco_media_diaria=round(foco_hoje.minutos_semana / 7) if foco_hoje.minutos_semana > 0 else 0,
        metas_em_andamento=sum(1 for m in metas_ativas if m.status == "em_andamento"),
        metas_concluidas=results["metas_concluidas"].count or 0,
        streak_dias=usuario.streak_atual,
        nivel_progresso=progresso_nivel,
    )

    return ContextoUsuario(
        usuario=usuario,
        tarefas=tarefas,
        pendencias=pendencias,
        habitos_ativos=habitos_ativos,
        categorias_habito=categorias_habito,
        foco_hoje=foco_hoje,
        metas_ativas=metas_ativas,
        objetivos_desenvolvimento=objetivos_desenvolvimento,
        eventos_proximos=eventos_proximos,
        cursos_em_progresso=cursos_em_progresso,
        analise_performance=analise_performance,
    )
