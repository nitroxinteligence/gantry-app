import type { ContextoUsuario } from './types'

export function buildSystemPrompt(contexto: ContextoUsuario): string {
  const { usuario, tarefasHoje, habitosAtivos, focoHoje, eventosHoje, metasAtivas } = contexto

  const tarefasTexto = tarefasHoje.length > 0
    ? tarefasHoje.map(t => `- ${t.titulo} [${t.prioridade}] (${t.coluna})${t.dataLimite ? ` prazo: ${t.dataLimite}` : ''}`).join('\n')
    : 'Nenhuma tarefa cadastrada.'

  const habitosTexto = habitosAtivos.length > 0
    ? habitosAtivos.map(h => `- ${h.titulo}: streak ${h.streakAtual} dias, ${h.concluídoHoje ? 'feito hoje' : 'pendente hoje'}`).join('\n')
    : 'Nenhum habito ativo.'

  const focoTexto = `Hoje: ${focoHoje.sessoesDia} sessoes (${focoHoje.minutosDia}min). Semana: ${focoHoje.sessoesSemana} sessoes (${focoHoje.minutosSemana}min).`

  const eventosTexto = eventosHoje.length > 0
    ? eventosHoje.map(e => `- ${e.horarioInicio}-${e.horarioFim}: ${e.titulo} (${e.categoria})`).join('\n')
    : 'Nenhum evento hoje.'

  const metasTexto = metasAtivas.length > 0
    ? metasAtivas.map(m => `- ${m.titulo}: ${m.progressoAtual}/${m.progressoTotal} (${m.status})`).join('\n')
    : 'Nenhuma meta ativa.'

  return `Voce e o Builder Assistant, um assistente de produtividade pessoal integrado ao app Builders Performance.

PERFIL DO USUARIO:
- Nome: ${usuario.nome}
- Nivel: ${usuario.nivel} | XP: ${usuario.xpTotal}
- Streak atual: ${usuario.streakAtual} dias

TAREFAS DE HOJE:
${tarefasTexto}

HABITOS ATIVOS:
${habitosTexto}

FOCO:
${focoTexto}

AGENDA DE HOJE:
${eventosTexto}

METAS ATIVAS:
${metasTexto}

INSTRUCOES:
- Responda sempre em portugues brasileiro, de forma concisa e motivadora.
- Use os dados acima para dar respostas contextualizadas.
- Quando o usuario pedir para criar tarefas, habitos ou sessoes de foco, use as funcoes disponíveis.
- Ofereça insights sobre produtividade baseados nos dados reais do usuario.
- Seja proativo: sugira melhorias quando perceber padroes.
- Mantenha respostas curtas (2-4 paragrafos no maximo).
- Nao invente dados que nao estao no contexto acima.`
}

export function buildMorningBriefingPrompt(contexto: ContextoUsuario): string {
  const base = buildSystemPrompt(contexto)

  return `${base}

TAREFA ESPECIAL - BRIEFING MATINAL:
Crie um briefing motivador e pratico para o dia do usuario. Inclua:
1. Saudacao personalizada com o nome
2. Resumo das tarefas prioritarias do dia
3. Status dos habitos (quais precisam ser feitos)
4. Sugestao de blocos de foco baseado na agenda
5. Mensagem motivacional curta baseada no streak/nivel

Formato: use marcadores e seja direto. Maximo 200 palavras.`
}
