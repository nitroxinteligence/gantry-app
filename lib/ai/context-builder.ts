import type { SupabaseClient } from '@supabase/supabase-js'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays, format } from 'date-fns'
import type {
  ContextoUsuario,
  ResumoTarefa,
  ResumoPendencia,
  ResumoHabito,
  ResumoCategoriaHabito,
  ResumoFoco,
  ResumoMeta,
  ResumoObjetivo,
  ResumoUsuario,
  AnalisePerformance,
} from './types'

export async function buildContextoUsuario(
  supabase: SupabaseClient,
  userId: string
): Promise<ContextoUsuario> {
  const hoje = new Date()
  const inicioHoje = startOfDay(hoje).toISOString()
  const fimHoje = endOfDay(hoje).toISOString()
  const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 }).toISOString()
  const fimSemana = endOfWeek(hoje, { weekStartsOn: 1 }).toISOString()
  const seteDiasAtras = subDays(hoje, 7).toISOString()
  const hojeStr = format(hoje, 'yyyy-MM-dd')

  const [
    usuarioRes,
    tarefasRes,
    tarefasConcluidasRes,
    pendenciasRes,
    habitosRes,
    checksHojeRes,
    categoriasRes,
    focoHojeRes,
    focoSemanaRes,
    focoTotalRes,
    metasRes,
    metasConcluidasRes,
    objetivosRes,
  ] = await Promise.all([
    supabase
      .from('users')
      .select('name, email, level, total_xp, current_streak, longest_streak, streak_shields, avatar_url, created_at')
      .eq('id', userId)
      .single(),
    supabase
      .from('tasks')
      .select('id, titulo, descricao, prioridade, status, coluna, data_limite, tags, tempo_gasto, xp_recompensa')
      .eq('user_id', userId)
      .neq('coluna', 'concluido')
      .order('prioridade', { ascending: false })
      .limit(50),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('coluna', 'concluido')
      .gte('concluida_em', seteDiasAtras),
    supabase
      .from('pending_items')
      .select('id, titulo, descricao, prioridade, categoria, data_vencimento')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('habits')
      .select('id, titulo, descricao, streak_atual, maior_streak, frequencia, dias_semana, xp_por_check, category_id')
      .eq('user_id', userId)
      .eq('ativo', true)
      .limit(30),
    supabase
      .from('habit_checks')
      .select('habit_id')
      .eq('user_id', userId)
      .eq('check_date', hojeStr),
    supabase
      .from('habit_categories')
      .select('id, titulo, icone, cor')
      .eq('user_id', userId)
      .order('ordem', { ascending: true }),
    supabase
      .from('focus_sessions')
      .select('duracao_real, xp_ganho')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', inicioHoje)
      .lte('created_at', fimHoje),
    supabase
      .from('focus_sessions')
      .select('duracao_real, xp_ganho')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', inicioSemana)
      .lte('created_at', fimSemana),
    supabase
      .from('focus_sessions')
      .select('duracao_real, xp_ganho')
      .eq('user_id', userId)
      .eq('status', 'completed'),
    supabase
      .from('goals')
      .select('id, titulo, descricao, progresso_atual, progresso_total, unidade, status, prazo, xp_recompensa')
      .eq('user_id', userId)
      .neq('status', 'concluido')
      .limit(20),
    supabase
      .from('goals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'concluido'),
    supabase
      .from('development_objectives')
      .select('id, titulo, descricao, categoria, progresso_atual, progresso_total, status, habitos_chave, xp_recompensa')
      .eq('user_id', userId)
      .neq('status', 'concluido')
      .limit(20),
  ])

  const usuario: ResumoUsuario = {
    nome: usuarioRes.data?.name ?? 'Usuario',
    email: usuarioRes.data?.email ?? '',
    nivel: usuarioRes.data?.level ?? 1,
    xpTotal: usuarioRes.data?.total_xp ?? 0,
    streakAtual: usuarioRes.data?.current_streak ?? 0,
    maiorStreak: usuarioRes.data?.longest_streak ?? 0,
    streakShields: usuarioRes.data?.streak_shields ?? 0,
    avatarUrl: usuarioRes.data?.avatar_url ?? null,
    criadoEm: usuarioRes.data?.created_at ?? '',
  }

  const tarefas: ResumoTarefa[] = (tarefasRes.data ?? []).map(t => ({
    id: t.id,
    titulo: t.titulo,
    descricao: t.descricao,
    prioridade: t.prioridade,
    status: t.status,
    coluna: t.coluna,
    dataLimite: t.data_limite,
    tags: t.tags ?? [],
    tempoGasto: t.tempo_gasto ?? 0,
    xpRecompensa: t.xp_recompensa ?? 10,
  }))

  const pendencias: ResumoPendencia[] = (pendenciasRes.data ?? []).map(p => ({
    id: p.id,
    titulo: p.titulo,
    descricao: p.descricao,
    prioridade: p.prioridade,
    categoria: p.categoria,
    dataVencimento: p.data_vencimento,
  }))

  const checksHojeSet = new Set<string>(
    (checksHojeRes.data ?? []).map(c => c.habit_id)
  )

  const habitosAtivos: ResumoHabito[] = (habitosRes.data ?? []).map(h => ({
    id: h.id,
    titulo: h.titulo,
    descricao: h.descricao,
    streakAtual: h.streak_atual ?? 0,
    maiorStreak: h.maior_streak ?? 0,
    frequencia: h.frequencia,
    diasSemana: h.dias_semana ?? [1, 2, 3, 4, 5, 6, 0],
    xpPorCheck: h.xp_por_check ?? 15,
    categoriaId: h.category_id,
    concluidoHoje: checksHojeSet.has(h.id),
  }))

  const categoriasHabito: ResumoCategoriaHabito[] = (categoriasRes.data ?? []).map(c => ({
    id: c.id,
    titulo: c.titulo,
    icone: c.icone,
    cor: c.cor,
  }))

  const sessoesDia = focoHojeRes.data ?? []
  const sessoesSemana = focoSemanaRes.data ?? []
  const sessoesTotal = focoTotalRes.data ?? []

  const totalMinutosFoco = Math.round(sessoesTotal.reduce((acc, s) => acc + (s.duracao_real ?? 0), 0) / 60)

  const focoHoje: ResumoFoco = {
    sessoesDia: sessoesDia.length,
    minutosDia: Math.round(sessoesDia.reduce((acc, s) => acc + (s.duracao_real ?? 0), 0) / 60),
    sessoesSemana: sessoesSemana.length,
    minutosSemana: Math.round(sessoesSemana.reduce((acc, s) => acc + (s.duracao_real ?? 0), 0) / 60),
    totalSessoes: sessoesTotal.length,
    totalMinutos: totalMinutosFoco,
    mediaMinutosPorSessao: sessoesTotal.length > 0
      ? Math.round(totalMinutosFoco / sessoesTotal.length)
      : 0,
    xpTotalFoco: sessoesTotal.reduce((acc, s) => acc + (s.xp_ganho ?? 0), 0),
  }

  const metasAtivas: ResumoMeta[] = (metasRes.data ?? []).map(m => ({
    id: m.id,
    titulo: m.titulo,
    descricao: m.descricao,
    progressoAtual: m.progresso_atual,
    progressoTotal: m.progresso_total,
    unidade: m.unidade ?? 'unidades',
    status: m.status,
    prazo: m.prazo,
    xpRecompensa: m.xp_recompensa ?? 100,
  }))

  const objetivosDesenvolvimento: ResumoObjetivo[] = (objetivosRes.data ?? []).map(o => ({
    id: o.id,
    titulo: o.titulo,
    descricao: o.descricao,
    categoria: o.categoria,
    progressoAtual: o.progresso_atual,
    progressoTotal: o.progresso_total,
    status: o.status,
    habitosChave: o.habitos_chave ?? [],
    xpRecompensa: o.xp_recompensa ?? 50,
  }))

  const habitosConcluidosHoje = habitosAtivos.filter(h => h.concluidoHoje).length
  const tarefasConcluidasRecentes = tarefasConcluidasRes.count ?? 0
  const xpProximoNivel = Math.pow(usuario.nivel, 2) * 100
  const xpNivelAnterior = Math.pow(usuario.nivel - 1, 2) * 100
  const progressoNivel = xpProximoNivel > xpNivelAnterior
    ? Math.round(((usuario.xpTotal - xpNivelAnterior) / (xpProximoNivel - xpNivelAnterior)) * 100)
    : 0

  const analisePerformance: AnalisePerformance = {
    tarefasConcluidasUltimos7Dias: tarefasConcluidasRecentes,
    tarefasTotalAtivas: tarefas.length,
    taxaConclusaoTarefas: tarefas.length + tarefasConcluidasRecentes > 0
      ? Math.round((tarefasConcluidasRecentes / (tarefas.length + tarefasConcluidasRecentes)) * 100)
      : 0,
    habitosConcluidosHoje: habitosConcluidosHoje,
    habitosTotalAtivos: habitosAtivos.length,
    taxaConclusaoHabitos: habitosAtivos.length > 0
      ? Math.round((habitosConcluidosHoje / habitosAtivos.length) * 100)
      : 0,
    focoMinutosHoje: focoHoje.minutosDia,
    focoMinutosSemana: focoHoje.minutosSemana,
    focoMediaDiaria: focoHoje.minutosSemana > 0
      ? Math.round(focoHoje.minutosSemana / 7)
      : 0,
    metasEmAndamento: metasAtivas.filter(m => m.status === 'em_andamento').length,
    metasConcluidas: metasConcluidasRes.count ?? 0,
    streakDias: usuario.streakAtual,
    nivelProgresso: progressoNivel,
  }

  return {
    usuario,
    tarefas,
    pendencias,
    habitosAtivos,
    categoriasHabito,
    focoHoje,
    metasAtivas,
    objetivosDesenvolvimento,
    analisePerformance,
  }
}
