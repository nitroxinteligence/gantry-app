import type { ContextoUsuario } from './types'

export function buildSystemPrompt(contexto: ContextoUsuario): string {
  const {
    usuario,
    tarefas,
    pendencias,
    habitosAtivos,
    categoriasHabito,
    focoHoje,
    metasAtivas,
    objetivosDesenvolvimento,
    analisePerformance: perf,
  } = contexto

  const tarefasPorColuna = {
    backlog: tarefas.filter(t => t.coluna === 'backlog'),
    a_fazer: tarefas.filter(t => t.coluna === 'a_fazer'),
    em_andamento: tarefas.filter(t => t.coluna === 'em_andamento'),
  }

  const tarefasTexto = tarefas.length > 0
    ? [
        tarefasPorColuna.em_andamento.length > 0 ? `Em Andamento (${tarefasPorColuna.em_andamento.length}):\n${tarefasPorColuna.em_andamento.map(t => `  - [${t.id.slice(0, 8)}] ${t.titulo} [${t.prioridade}]${t.dataLimite ? ` prazo: ${t.dataLimite}` : ''}`).join('\n')}` : null,
        tarefasPorColuna.a_fazer.length > 0 ? `A Fazer (${tarefasPorColuna.a_fazer.length}):\n${tarefasPorColuna.a_fazer.map(t => `  - [${t.id.slice(0, 8)}] ${t.titulo} [${t.prioridade}]${t.dataLimite ? ` prazo: ${t.dataLimite}` : ''}`).join('\n')}` : null,
        tarefasPorColuna.backlog.length > 0 ? `Backlog (${tarefasPorColuna.backlog.length}):\n${tarefasPorColuna.backlog.slice(0, 5).map(t => `  - [${t.id.slice(0, 8)}] ${t.titulo} [${t.prioridade}]`).join('\n')}${tarefasPorColuna.backlog.length > 5 ? `\n  ... e mais ${tarefasPorColuna.backlog.length - 5}` : ''}` : null,
      ].filter(Boolean).join('\n')
    : 'Nenhuma tarefa ativa.'

  const pendenciasTexto = pendencias.length > 0
    ? pendencias.map(p => `- [${p.id.slice(0, 8)}] ${p.titulo} [${p.prioridade}]${p.categoria ? ` (${p.categoria})` : ''}`).join('\n')
    : 'Nenhuma pendencia.'

  const categoriasMap = new Map(categoriasHabito.map(c => [c.id, c.titulo]))

  const habitosTexto = habitosAtivos.length > 0
    ? habitosAtivos.map(h => {
        const cat = h.categoriaId ? categoriasMap.get(h.categoriaId) : null
        return `- [${h.id.slice(0, 8)}] ${h.titulo}${cat ? ` (${cat})` : ''}: streak ${h.streakAtual} dias (record: ${h.maiorStreak}), ${h.concluidoHoje ? 'FEITO hoje' : 'PENDENTE hoje'}`
      }).join('\n')
    : 'Nenhum habito ativo.'

  const focoTexto = [
    `Hoje: ${focoHoje.sessoesDia} sessoes (${focoHoje.minutosDia}min)`,
    `Semana: ${focoHoje.sessoesSemana} sessoes (${focoHoje.minutosSemana}min)`,
    `Total historico: ${focoHoje.totalSessoes} sessoes (${focoHoje.totalMinutos}min), media ${focoHoje.mediaMinutosPorSessao}min/sessao`,
    `XP total de foco: ${focoHoje.xpTotalFoco}`,
  ].join('\n')

  const metasTexto = metasAtivas.length > 0
    ? metasAtivas.map(m => `- [${m.id.slice(0, 8)}] ${m.titulo}: ${m.progressoAtual}/${m.progressoTotal} ${m.unidade} (${m.status})${m.prazo ? ` prazo: ${m.prazo}` : ''}`).join('\n')
    : 'Nenhuma meta ativa.'

  const objetivosTexto = objetivosDesenvolvimento.length > 0
    ? objetivosDesenvolvimento.map(o => `- [${o.id.slice(0, 8)}] ${o.titulo} [${o.categoria}]: ${o.progressoAtual}/${o.progressoTotal} (${o.status})`).join('\n')
    : 'Nenhum objetivo de desenvolvimento.'

  const perfTexto = [
    `Tarefas concluidas (7 dias): ${perf.tarefasConcluidasUltimos7Dias} | Ativas: ${perf.tarefasTotalAtivas} | Taxa: ${perf.taxaConclusaoTarefas}%`,
    `Habitos hoje: ${perf.habitosConcluidosHoje}/${perf.habitosTotalAtivos} (${perf.taxaConclusaoHabitos}%)`,
    `Foco hoje: ${perf.focoMinutosHoje}min | Semana: ${perf.focoMinutosSemana}min | Media diaria: ${perf.focoMediaDiaria}min`,
    `Metas: ${perf.metasEmAndamento} em andamento, ${perf.metasConcluidas} concluidas`,
    `Streak: ${perf.streakDias} dias | Progresso nivel: ${perf.nivelProgresso}%`,
  ].join('\n')

  return `Voce e o Builder Assistant, assistente de produtividade pessoal do app Builders Performance.
Voce tem ACESSO TOTAL a todos os dados do usuario e pode executar acoes (criar, editar, excluir) via funcoes.

PERFIL DO USUARIO:
- Nome: ${usuario.nome}
- Nivel: ${usuario.nivel} | XP Total: ${usuario.xpTotal} | Progresso nivel: ${perf.nivelProgresso}%
- Streak atual: ${usuario.streakAtual} dias (record: ${usuario.maiorStreak})
- Streak shields: ${usuario.streakShields}/2
- No app desde: ${usuario.criadoEm ? new Date(usuario.criadoEm).toLocaleDateString('pt-BR') : 'desconhecido'}

QUADRO KANBAN (${tarefas.length} tarefas ativas):
${tarefasTexto}

PENDENCIAS (${pendencias.length}):
${pendenciasTexto}

HABITOS ATIVOS (${habitosAtivos.length}):
${habitosTexto}

FOCO:
${focoTexto}

METAS ATIVAS (${metasAtivas.length}):
${metasTexto}

OBJETIVOS DE DESENVOLVIMENTO (${objetivosDesenvolvimento.length}):
${objetivosTexto}

ANALISE DE PERFORMANCE:
${perfTexto}

INSTRUCOES:
- Responda sempre em portugues brasileiro, de forma concisa e motivadora.
- Use os dados acima para dar respostas 100% contextualizadas.
- Quando o usuario pedir para criar, editar ou excluir tarefas, habitos, metas ou pendencias, use as funcoes disponíveis.
- Para editar/excluir, use os IDs entre colchetes mostrados acima (ex: [abc12345]).
- Ofereça insights sobre produtividade baseados nos dados reais do usuario.
- Seja proativo: sugira melhorias quando perceber padroes nos dados.
- Mantenha respostas curtas (2-4 paragrafos no maximo).
- Nao invente dados que nao estao no contexto acima.
- Ao analisar performance, use os numeros reais da secao ANALISE DE PERFORMANCE.`
}

export function buildMorningBriefingPrompt(contexto: ContextoUsuario): string {
  const base = buildSystemPrompt(contexto)
  const { analisePerformance: perf } = contexto

  return `${base}

TAREFA ESPECIAL - BRIEFING MATINAL COMPLETO:
Analise 100% dos dados do usuario acima e crie um briefing matinal completo e motivador.

Estrutura obrigatoria:
1. SAUDACAO personalizada com o nome e nivel do usuario
2. PANORAMA DO DIA: tarefas prioritarias (urgentes/altas primeiro), habitos pendentes, pendencias
3. ANALISE DE PERFORMANCE: como o usuario esta indo nos ultimos 7 dias (taxa de conclusao, foco, streaks)
4. PLANO DE ACAO: sugestao concreta de blocos de foco e ordem de prioridade para o dia
5. METAS & OBJETIVOS: progresso atual e proximo passo recomendado
6. MOTIVACAO: mensagem personalizada baseada no streak (${perf.streakDias} dias), nivel e conquistas recentes

Formato: use marcadores, emojis moderados e seja direto. Maximo 400 palavras.
O briefing deve demonstrar que voce conhece TODOS os dados do usuario profundamente.`
}
