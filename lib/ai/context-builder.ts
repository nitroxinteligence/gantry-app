import type { SupabaseClient } from '@supabase/supabase-js'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import type { ContextoUsuario, ResumoPorCategoria, ResumoHabito, ResumoFoco, ResumoEvento, ResumoMeta, ResumoUsuario } from './types'

export async function buildContextoUsuario(
  supabase: SupabaseClient,
  userId: string
): Promise<ContextoUsuario> {
  const hoje = new Date()
  const inicioHoje = startOfDay(hoje).toISOString()
  const fimHoje = endOfDay(hoje).toISOString()
  const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 }).toISOString()
  const fimSemana = endOfWeek(hoje, { weekStartsOn: 1 }).toISOString()
  const hojeStr = format(hoje, 'yyyy-MM-dd')

  const [
    usuarioRes,
    tarefasRes,
    habitosRes,
    checksRes,
    focoHojeRes,
    focoSemanaRes,
    eventosRes,
    metasRes,
  ] = await Promise.all([
    supabase.from('users').select('name, level, total_xp, current_streak').eq('id', userId).single(),
    supabase.from('tasks').select('titulo, prioridade, coluna, data_limite').eq('user_id', userId).neq('coluna', 'concluido').order('prioridade', { ascending: false }).limit(20),
    supabase.from('habits').select('id, titulo, streak_atual, frequencia').eq('user_id', userId).eq('ativo', true).limit(20),
    supabase.from('habit_checks').select('habito_id, concluido').eq('user_id', userId).eq('data', hojeStr),
    supabase.from('focus_sessions').select('duracao_real').eq('user_id', userId).gte('created_at', inicioHoje).lte('created_at', fimHoje).eq('status', 'completed'),
    supabase.from('focus_sessions').select('duracao_real').eq('user_id', userId).gte('created_at', inicioSemana).lte('created_at', fimSemana).eq('status', 'completed'),
    supabase.from('events').select('titulo, horario_inicio, horario_fim, categoria').eq('user_id', userId).eq('data', hojeStr).order('horario_inicio', { ascending: true }).limit(10),
    supabase.from('goals').select('titulo, progresso_atual, progresso_total, status').eq('user_id', userId).neq('status', 'concluida').limit(10),
  ])

  const usuario: ResumoUsuario = {
    nome: usuarioRes.data?.name ?? 'Usuario',
    nivel: usuarioRes.data?.level ?? 1,
    xpTotal: usuarioRes.data?.total_xp ?? 0,
    streakAtual: usuarioRes.data?.current_streak ?? 0,
  }

  const tarefasHoje: ResumoPorCategoria[] = (tarefasRes.data ?? []).map(t => ({
    titulo: t.titulo,
    prioridade: t.prioridade,
    coluna: t.coluna,
    dataLimite: t.data_limite,
  }))

  const checksHojeMap = new Map<string, boolean>()
  for (const c of checksRes.data ?? []) {
    checksHojeMap.set(c.habito_id, c.concluido)
  }

  const habitosAtivos: ResumoHabito[] = (habitosRes.data ?? []).map(h => ({
    titulo: h.titulo,
    streakAtual: h.streak_atual,
    frequencia: h.frequencia,
    concluídoHoje: checksHojeMap.get(h.id) ?? false,
  }))

  const sessoesDia = focoHojeRes.data ?? []
  const sessoesSemana = focoSemanaRes.data ?? []

  const focoHoje: ResumoFoco = {
    sessoesDia: sessoesDia.length,
    minutosDia: Math.round(sessoesDia.reduce((acc, s) => acc + (s.duracao_real ?? 0), 0) / 60),
    sessoesSemana: sessoesSemana.length,
    minutosSemana: Math.round(sessoesSemana.reduce((acc, s) => acc + (s.duracao_real ?? 0), 0) / 60),
  }

  const eventosHoje: ResumoEvento[] = (eventosRes.data ?? []).map(e => ({
    titulo: e.titulo,
    horarioInicio: e.horario_inicio,
    horarioFim: e.horario_fim,
    categoria: e.categoria,
  }))

  const metasAtivas: ResumoMeta[] = (metasRes.data ?? []).map(m => ({
    titulo: m.titulo,
    progressoAtual: m.progresso_atual,
    progressoTotal: m.progresso_total,
    status: m.status,
  }))

  return { usuario, tarefasHoje, habitosAtivos, focoHoje, eventosHoje, metasAtivas }
}
