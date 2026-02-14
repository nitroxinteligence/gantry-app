import logging

from app.utils.supabase_client import get_supabase

logger = logging.getLogger(__name__)


class FunctionResult:
    def __init__(self, sucesso: bool, mensagem: str):
        self.sucesso = sucesso
        self.mensagem = mensagem

    def to_dict(self) -> dict:
        return {"sucesso": self.sucesso, "mensagem": self.mensagem}


async def executar_funcao(
    user_id: str,
    nome: str,
    args: dict,
) -> FunctionResult:
    try:
        handlers = {
            "criar_tarefa": _criar_tarefa,
            "editar_tarefa": _editar_tarefa,
            "excluir_tarefa": _excluir_tarefa,
            "concluir_tarefa": _concluir_tarefa,
            "criar_habito": _criar_habito,
            "editar_habito": _editar_habito,
            "excluir_habito": _excluir_habito,
            "marcar_habito": _marcar_habito,
            "criar_meta": _criar_meta,
            "editar_meta": _editar_meta,
            "excluir_meta": _excluir_meta,
            "criar_pendencia": _criar_pendencia,
            "agendar_foco": _agendar_foco,
            "analisar_performance": _analisar_performance,
            "criar_evento": _criar_evento,
            "editar_evento": _editar_evento,
            "excluir_evento": _excluir_evento,
            "recomendar_curso": _recomendar_curso,
        }

        handler = handlers.get(nome)
        if not handler:
            return FunctionResult(False, f"Funcao desconhecida: {nome}")

        return await handler(user_id, args)
    except Exception as e:
        logger.error("Erro ao executar %s: %s", nome, e)
        return FunctionResult(False, f"Erro ao executar {nome}: {e}")


async def _criar_tarefa(user_id: str, args: dict) -> FunctionResult:
    titulo = str(args.get("titulo", "")).strip()
    if not titulo:
        return FunctionResult(False, "Titulo da tarefa e obrigatorio")

    sb = get_supabase()
    res = sb.table("tasks").insert({
        "user_id": user_id,
        "titulo": titulo,
        "descricao": args.get("descricao"),
        "prioridade": str(args.get("prioridade", "media")),
        "status": "pendente",
        "coluna": "a_fazer",
        "data_limite": args.get("data_limite"),
        "xp_recompensa": 10,
        "tags": [],
        "ordem": 0,
    }).execute()

    if hasattr(res, "error") and res.error:
        return FunctionResult(False, f"Erro ao criar tarefa: {res.error}")

    return FunctionResult(True, f'Tarefa "{titulo}" criada com sucesso na coluna A Fazer!')


async def _editar_tarefa(user_id: str, args: dict) -> FunctionResult:
    tarefa_id = str(args.get("tarefa_id", ""))
    if not tarefa_id:
        return FunctionResult(False, "ID da tarefa e obrigatorio")

    updates: dict = {}
    for campo in ("titulo", "prioridade", "coluna", "descricao", "data_limite"):
        if campo in args and args[campo] is not None:
            updates[campo] = str(args[campo]) if args[campo] else None

    if not updates:
        return FunctionResult(False, "Nenhum campo para atualizar")

    sb = get_supabase()
    sb.table("tasks").update(updates).eq("id", tarefa_id).eq("user_id", user_id).execute()

    campos = ", ".join(updates.keys())
    return FunctionResult(True, f"Tarefa atualizada ({campos})!")


async def _excluir_tarefa(user_id: str, args: dict) -> FunctionResult:
    tarefa_id = str(args.get("tarefa_id", ""))
    if not tarefa_id:
        return FunctionResult(False, "ID da tarefa e obrigatorio")

    sb = get_supabase()
    titulo_res = sb.table("tasks").select("titulo").eq("id", tarefa_id).eq("user_id", user_id).single().execute()
    titulo = titulo_res.data.get("titulo", tarefa_id) if titulo_res.data else tarefa_id

    sb.table("tasks").delete().eq("id", tarefa_id).eq("user_id", user_id).execute()

    return FunctionResult(True, f'Tarefa "{titulo}" excluida!')


async def _concluir_tarefa(user_id: str, args: dict) -> FunctionResult:
    tarefa_id = str(args.get("tarefa_id", ""))
    if not tarefa_id:
        return FunctionResult(False, "ID da tarefa e obrigatorio")

    sb = get_supabase()
    tarefa_res = sb.table("tasks").select("titulo, xp_recompensa").eq("id", tarefa_id).eq("user_id", user_id).single().execute()
    tarefa = tarefa_res.data

    from datetime import datetime, timezone
    sb.table("tasks").update({
        "coluna": "concluido",
        "status": "concluido",
        "concluida_em": datetime.now(timezone.utc).isoformat(),
    }).eq("id", tarefa_id).eq("user_id", user_id).execute()

    xp = tarefa.get("xp_recompensa", 10) if tarefa else 10
    if xp:
        sb.rpc("add_user_xp", {"p_user_id": user_id, "p_xp_amount": xp}).execute()

    titulo = tarefa.get("titulo", tarefa_id) if tarefa else tarefa_id
    return FunctionResult(True, f'Tarefa "{titulo}" concluida! +{xp} XP')


async def _criar_habito(user_id: str, args: dict) -> FunctionResult:
    titulo = str(args.get("titulo", "")).strip()
    if not titulo:
        return FunctionResult(False, "Titulo do habito e obrigatorio")

    sb = get_supabase()
    sb.table("habits").insert({
        "user_id": user_id,
        "titulo": titulo,
        "descricao": args.get("descricao"),
        "frequencia": str(args.get("frequencia", "diario")),
        "dias_semana": [1, 2, 3, 4, 5, 6, 0],
        "ativo": True,
        "ordem": 0,
    }).execute()

    return FunctionResult(True, f'Habito "{titulo}" criado com sucesso!')


async def _editar_habito(user_id: str, args: dict) -> FunctionResult:
    habito_id = str(args.get("habito_id", ""))
    if not habito_id:
        return FunctionResult(False, "ID do habito e obrigatorio")

    updates: dict = {}
    for campo in ("titulo", "frequencia", "descricao"):
        if campo in args and args[campo] is not None:
            updates[campo] = str(args[campo]) if args[campo] else None

    if not updates:
        return FunctionResult(False, "Nenhum campo para atualizar")

    sb = get_supabase()
    sb.table("habits").update(updates).eq("id", habito_id).eq("user_id", user_id).execute()

    return FunctionResult(True, "Habito atualizado!")


async def _excluir_habito(user_id: str, args: dict) -> FunctionResult:
    habito_id = str(args.get("habito_id", ""))
    if not habito_id:
        return FunctionResult(False, "ID do habito e obrigatorio")

    sb = get_supabase()
    titulo_res = sb.table("habits").select("titulo").eq("id", habito_id).eq("user_id", user_id).single().execute()
    titulo = titulo_res.data.get("titulo", habito_id) if titulo_res.data else habito_id

    sb.table("habits").delete().eq("id", habito_id).eq("user_id", user_id).execute()

    return FunctionResult(True, f'Habito "{titulo}" excluido!')


async def _marcar_habito(user_id: str, args: dict) -> FunctionResult:
    habito_id = str(args.get("habito_id", ""))
    if not habito_id:
        return FunctionResult(False, "ID do habito e obrigatorio")

    sb = get_supabase()
    res = sb.rpc("check_habit", {"p_habit_id": habito_id, "p_user_id": user_id}).execute()

    data = res.data
    result = data[0] if isinstance(data, list) and data else data

    if result and result.get("xp_ganho", 0) == 0:
        return FunctionResult(True, "Habito ja estava marcado como feito hoje.")

    xp = result.get("xp_ganho", 15) if result else 15
    streak = result.get("streak_atual", 1) if result else 1
    return FunctionResult(True, f"Habito marcado como feito! +{xp} XP | Streak: {streak} dias")


async def _criar_meta(user_id: str, args: dict) -> FunctionResult:
    titulo = str(args.get("titulo", "")).strip()
    if not titulo:
        return FunctionResult(False, "Titulo da meta e obrigatorio")

    sb = get_supabase()
    sb.table("goals").insert({
        "user_id": user_id,
        "titulo": titulo,
        "descricao": args.get("descricao"),
        "progresso_total": int(args.get("progresso_total", 100)),
        "unidade": str(args.get("unidade", "unidades")),
        "status": "a_fazer",
        "xp_recompensa": 100,
    }).execute()

    return FunctionResult(True, f'Meta "{titulo}" criada com sucesso!')


async def _editar_meta(user_id: str, args: dict) -> FunctionResult:
    meta_id = str(args.get("meta_id", ""))
    if not meta_id:
        return FunctionResult(False, "ID da meta e obrigatorio")

    updates: dict = {}
    if "titulo" in args:
        updates["titulo"] = str(args["titulo"])
    if "progresso_atual" in args:
        updates["progresso_atual"] = int(args["progresso_atual"])
    if "status" in args:
        updates["status"] = str(args["status"])

    if not updates:
        return FunctionResult(False, "Nenhum campo para atualizar")

    sb = get_supabase()
    sb.table("goals").update(updates).eq("id", meta_id).eq("user_id", user_id).execute()

    return FunctionResult(True, "Meta atualizada!")


async def _excluir_meta(user_id: str, args: dict) -> FunctionResult:
    meta_id = str(args.get("meta_id", ""))
    if not meta_id:
        return FunctionResult(False, "ID da meta e obrigatorio")

    sb = get_supabase()
    titulo_res = sb.table("goals").select("titulo").eq("id", meta_id).eq("user_id", user_id).single().execute()
    titulo = titulo_res.data.get("titulo", meta_id) if titulo_res.data else meta_id

    sb.table("goals").delete().eq("id", meta_id).eq("user_id", user_id).execute()

    return FunctionResult(True, f'Meta "{titulo}" excluida!')


async def _criar_pendencia(user_id: str, args: dict) -> FunctionResult:
    titulo = str(args.get("titulo", "")).strip()
    if not titulo:
        return FunctionResult(False, "Titulo da pendencia e obrigatorio")

    sb = get_supabase()
    sb.table("pending_items").insert({
        "user_id": user_id,
        "titulo": titulo,
        "descricao": args.get("descricao"),
        "prioridade": str(args.get("prioridade", "media")),
    }).execute()

    return FunctionResult(True, f'Pendencia "{titulo}" criada!')


async def _agendar_foco(_user_id: str, args: dict) -> FunctionResult:
    duracao = int(args.get("duracao_minutos", 25))
    modo = str(args.get("modo", "pomodoro"))
    return FunctionResult(
        True,
        f"Sessao de foco sugerida: {duracao}min no modo {modo}. Acesse a pagina /foco para iniciar.",
    )


async def _analisar_performance(_user_id: str, _args: dict) -> FunctionResult:
    return FunctionResult(True, "Analise de performance gerada com base nos dados do contexto.")


async def _criar_evento(user_id: str, args: dict) -> FunctionResult:
    titulo = str(args.get("titulo", "")).strip()
    if not titulo:
        return FunctionResult(False, "Titulo do evento e obrigatorio")

    data = str(args.get("data", ""))
    horario_inicio = str(args.get("horario_inicio", ""))
    horario_fim = str(args.get("horario_fim", ""))
    if not data or not horario_inicio or not horario_fim:
        return FunctionResult(False, "Data, horario de inicio e fim sao obrigatorios")

    sb = get_supabase()
    sb.table("events").insert({
        "user_id": user_id,
        "titulo": titulo,
        "descricao": args.get("descricao"),
        "data": data,
        "horario_inicio": horario_inicio,
        "horario_fim": horario_fim,
        "categoria": str(args.get("categoria", "geral")),
        "status": "confirmado",
        "calendario": "Manual",
    }).execute()

    return FunctionResult(True, f'Evento "{titulo}" criado para {data} ({horario_inicio}-{horario_fim})!')


async def _editar_evento(user_id: str, args: dict) -> FunctionResult:
    evento_id = str(args.get("evento_id", ""))
    if not evento_id:
        return FunctionResult(False, "ID do evento e obrigatorio")

    updates: dict = {}
    for campo in ("titulo", "descricao", "data", "horario_inicio", "horario_fim", "categoria"):
        if campo in args and args[campo] is not None:
            updates[campo] = str(args[campo]) if args[campo] else None

    if not updates:
        return FunctionResult(False, "Nenhum campo para atualizar")

    sb = get_supabase()
    sb.table("events").update(updates).eq("id", evento_id).eq("user_id", user_id).execute()

    campos = ", ".join(updates.keys())
    return FunctionResult(True, f"Evento atualizado ({campos})!")


async def _excluir_evento(user_id: str, args: dict) -> FunctionResult:
    evento_id = str(args.get("evento_id", ""))
    if not evento_id:
        return FunctionResult(False, "ID do evento e obrigatorio")

    sb = get_supabase()
    titulo_res = sb.table("events").select("titulo").eq("id", evento_id).eq("user_id", user_id).single().execute()
    titulo = titulo_res.data.get("titulo", evento_id) if titulo_res.data else evento_id

    sb.table("events").delete().eq("id", evento_id).eq("user_id", user_id).execute()

    return FunctionResult(True, f'Evento "{titulo}" excluido!')


async def _recomendar_curso(user_id: str, _args: dict) -> FunctionResult:
    sb = get_supabase()
    cursos_res = sb.table("courses").select("id, titulo, descricao, categoria, nivel").eq("status", "publicado").limit(5).execute()
    cursos = cursos_res.data or []

    if not cursos:
        return FunctionResult(True, "Nenhum curso disponivel no momento. Novos cursos serao adicionados em breve!")

    lista = "\n".join(f"- {c['titulo']} ({c.get('nivel', 'iniciante')}) - {c.get('categoria', 'geral')}" for c in cursos)
    return FunctionResult(True, f"Cursos recomendados:\n{lista}\n\nAcesse a pagina /cursos para comecar!")
