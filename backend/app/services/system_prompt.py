from app.models.context import ContextoUsuario


def build_system_prompt(contexto: ContextoUsuario) -> str:
    u = contexto.usuario
    tarefas = contexto.tarefas
    pendencias = contexto.pendencias
    habitos = contexto.habitos_ativos
    categorias = contexto.categorias_habito
    foco = contexto.foco_hoje
    metas = contexto.metas_ativas
    objetivos = contexto.objetivos_desenvolvimento
    eventos = contexto.eventos_proximos
    cursos = contexto.cursos_em_progresso
    perf = contexto.analise_performance

    em_andamento = [t for t in tarefas if t.coluna == "em_andamento"]
    a_fazer = [t for t in tarefas if t.coluna == "a_fazer"]
    backlog = [t for t in tarefas if t.coluna == "backlog"]

    partes_tarefas = []
    if em_andamento:
        itens = "\n".join(
            f"  - [{t.id[:8]}] {t.titulo} [{t.prioridade}]{f' prazo: {t.data_limite}' if t.data_limite else ''}"
            for t in em_andamento
        )
        partes_tarefas.append(f"Em Andamento ({len(em_andamento)}):\n{itens}")
    if a_fazer:
        itens = "\n".join(
            f"  - [{t.id[:8]}] {t.titulo} [{t.prioridade}]{f' prazo: {t.data_limite}' if t.data_limite else ''}"
            for t in a_fazer
        )
        partes_tarefas.append(f"A Fazer ({len(a_fazer)}):\n{itens}")
    if backlog:
        itens = "\n".join(
            f"  - [{t.id[:8]}] {t.titulo} [{t.prioridade}]"
            for t in backlog[:5]
        )
        extra = f"\n  ... e mais {len(backlog) - 5}" if len(backlog) > 5 else ""
        partes_tarefas.append(f"Backlog ({len(backlog)}):\n{itens}{extra}")

    tarefas_texto = "\n".join(partes_tarefas) if partes_tarefas else "Nenhuma tarefa ativa."

    pendencias_texto = (
        "\n".join(
            f"- [{p.id[:8]}] {p.titulo} [{p.prioridade}]{f' ({p.categoria})' if p.categoria else ''}"
            for p in pendencias
        )
        if pendencias
        else "Nenhuma pendencia."
    )

    cat_map = {c.id: c.titulo for c in categorias}
    habitos_texto = (
        "\n".join(
            f"- [{h.id[:8]}] {h.titulo}{f' ({cat_map[h.categoria_id]})' if h.categoria_id and h.categoria_id in cat_map else ''}"
            f": streak {h.streak_atual} dias (record: {h.maior_streak}),"
            f" {'FEITO hoje' if h.concluido_hoje else 'PENDENTE hoje'}"
            for h in habitos
        )
        if habitos
        else "Nenhum habito ativo."
    )

    foco_texto = "\n".join([
        f"Hoje: {foco.sessoes_dia} sessoes ({foco.minutos_dia}min)",
        f"Semana: {foco.sessoes_semana} sessoes ({foco.minutos_semana}min)",
        f"Total historico: {foco.total_sessoes} sessoes ({foco.total_minutos}min), media {foco.media_minutos_por_sessao}min/sessao",
        f"XP total de foco: {foco.xp_total_foco}",
    ])

    metas_texto = (
        "\n".join(
            f"- [{m.id[:8]}] {m.titulo}: {m.progresso_atual}/{m.progresso_total} {m.unidade}"
            f" ({m.status}){f' prazo: {m.prazo}' if m.prazo else ''}"
            for m in metas
        )
        if metas
        else "Nenhuma meta ativa."
    )

    objetivos_texto = (
        "\n".join(
            f"- [{o.id[:8]}] {o.titulo} [{o.categoria}]: {o.progresso_atual}/{o.progresso_total} ({o.status})"
            for o in objetivos
        )
        if objetivos
        else "Nenhum objetivo de desenvolvimento."
    )

    eventos_texto = (
        "\n".join(
            f"- [{e.id[:8]}] {e.titulo} em {e.data} {e.horario_inicio}-{e.horario_fim}"
            f"{f' ({e.categoria})' if e.categoria else ''}{f' em {e.local}' if e.local else ''}"
            for e in eventos
        )
        if eventos
        else "Nenhum evento proximo."
    )

    cursos_texto = (
        "\n".join(
            f"- {c.titulo} [{c.nivel}]: {c.aulas_concluidas}/{c.total_aulas} aulas ({c.progresso_percentual}%)"
            for c in cursos
        )
        if cursos
        else "Nenhum curso em progresso."
    )

    perf_texto = "\n".join([
        f"Tarefas concluidas (7 dias): {perf.tarefas_concluidas_ultimos_7_dias} | Ativas: {perf.tarefas_total_ativas} | Taxa: {perf.taxa_conclusao_tarefas}%",
        f"Habitos hoje: {perf.habitos_concluidos_hoje}/{perf.habitos_total_ativos} ({perf.taxa_conclusao_habitos}%)",
        f"Foco hoje: {perf.foco_minutos_hoje}min | Semana: {perf.foco_minutos_semana}min | Media diaria: {perf.foco_media_diaria}min",
        f"Metas: {perf.metas_em_andamento} em andamento, {perf.metas_concluidas} concluidas",
        f"Streak: {perf.streak_dias} dias | Progresso nivel: {perf.nivel_progresso}%",
    ])

    criado_formatado = ""
    if u.criado_em:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(u.criado_em.replace("Z", "+00:00"))
            criado_formatado = dt.strftime("%d/%m/%Y")
        except Exception:
            criado_formatado = "desconhecido"

    return f"""Voce e o Builder Assistant, assistente de produtividade pessoal do app Builders Performance.
Voce tem ACESSO TOTAL a todos os dados do usuario e pode executar acoes (criar, editar, excluir) via funcoes.

PERFIL DO USUARIO:
- Nome: {u.nome}
- Nivel: {u.nivel} | XP Total: {u.xp_total} | Progresso nivel: {perf.nivel_progresso}%
- Streak atual: {u.streak_atual} dias (record: {u.maior_streak})
- Streak shields: {u.streak_shields}/2
- No app desde: {criado_formatado}

QUADRO KANBAN ({len(tarefas)} tarefas ativas):
{tarefas_texto}

PENDENCIAS ({len(pendencias)}):
{pendencias_texto}

HABITOS ATIVOS ({len(habitos)}):
{habitos_texto}

FOCO:
{foco_texto}

METAS ATIVAS ({len(metas)}):
{metas_texto}

OBJETIVOS DE DESENVOLVIMENTO ({len(objetivos)}):
{objetivos_texto}

AGENDA PROXIMOS 7 DIAS ({len(eventos)} eventos):
{eventos_texto}

CURSOS EM PROGRESSO ({len(cursos)}):
{cursos_texto}

ANALISE DE PERFORMANCE:
{perf_texto}

INSTRUCOES:
- Responda sempre em portugues brasileiro, de forma concisa e motivadora.
- Use os dados acima para dar respostas 100% contextualizadas.
- Quando o usuario pedir para criar, editar ou excluir tarefas, habitos, metas, pendencias ou eventos, use as funcoes disponiveis.
- Para editar/excluir, use os IDs entre colchetes mostrados acima (ex: [abc12345]).
- Ofereça insights sobre produtividade baseados nos dados reais do usuario.
- Seja proativo: sugira melhorias quando perceber padroes nos dados.
- Mantenha respostas curtas (2-4 paragrafos no maximo).
- Nao invente dados que nao estao no contexto acima.
- Ao analisar performance, use os numeros reais da secao ANALISE DE PERFORMANCE.
- Para eventos, voce pode criar, editar e excluir eventos na agenda.
- Para cursos, voce pode recomendar cursos relevantes baseado no perfil do usuario."""


def build_morning_briefing_prompt(contexto: ContextoUsuario) -> str:
    base = build_system_prompt(contexto)
    perf = contexto.analise_performance

    return f"""{base}

TAREFA ESPECIAL - BRIEFING MATINAL COMPLETO:
Analise 100% dos dados do usuario acima e crie um briefing matinal completo e motivador.

Estrutura obrigatoria:
1. SAUDACAO personalizada com o nome e nivel do usuario
2. PANORAMA DO DIA: tarefas prioritarias (urgentes/altas primeiro), habitos pendentes, pendencias, eventos do dia
3. ANALISE DE PERFORMANCE: como o usuario esta indo nos ultimos 7 dias (taxa de conclusao, foco, streaks)
4. PLANO DE ACAO: sugestao concreta de blocos de foco e ordem de prioridade para o dia
5. METAS & OBJETIVOS: progresso atual e proximo passo recomendado
6. CURSOS: progresso nos cursos e sugestao de proximo passo
7. MOTIVACAO: mensagem personalizada baseada no streak ({perf.streak_dias} dias), nivel e conquistas recentes

Formato: use marcadores, emojis moderados e seja direto. Maximo 400 palavras.
O briefing deve demonstrar que voce conhece TODOS os dados do usuario profundamente."""
