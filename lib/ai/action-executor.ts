import type { SupabaseClient } from '@supabase/supabase-js'

interface FunctionCallResult {
  sucesso: boolean
  mensagem: string
}

export async function executarFuncao(
  supabase: SupabaseClient,
  userId: string,
  nome: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  try {
    switch (nome) {
      case 'criar_tarefa':
        return await criarTarefa(supabase, userId, args)
      case 'editar_tarefa':
        return await editarTarefa(supabase, userId, args)
      case 'excluir_tarefa':
        return await excluirTarefa(supabase, userId, args)
      case 'concluir_tarefa':
        return await concluirTarefa(supabase, userId, args)
      case 'criar_habito':
        return await criarHabito(supabase, userId, args)
      case 'editar_habito':
        return await editarHabito(supabase, userId, args)
      case 'excluir_habito':
        return await excluirHabito(supabase, userId, args)
      case 'marcar_habito':
        return await marcarHabito(supabase, userId, args)
      case 'criar_meta':
        return await criarMeta(supabase, userId, args)
      case 'editar_meta':
        return await editarMeta(supabase, userId, args)
      case 'excluir_meta':
        return await excluirMeta(supabase, userId, args)
      case 'criar_pendencia':
        return await criarPendencia(supabase, userId, args)
      case 'agendar_foco':
        return agendarFoco(args)
      case 'analisar_performance':
        return { sucesso: true, mensagem: 'Analise de performance gerada com base nos dados do contexto.' }
      default:
        return { sucesso: false, mensagem: `Funcao desconhecida: ${nome}` }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido'
    return { sucesso: false, mensagem: `Erro ao executar ${nome}: ${msg}` }
  }
}

async function criarTarefa(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const titulo = String(args.titulo ?? '').trim()
  if (!titulo) {
    return { sucesso: false, mensagem: 'Titulo da tarefa e obrigatorio' }
  }

  const { error } = await supabase.from('tasks').insert({
    user_id: userId,
    titulo,
    descricao: args.descricao ? String(args.descricao) : null,
    prioridade: String(args.prioridade ?? 'media'),
    status: 'pendente',
    coluna: 'a_fazer',
    data_limite: args.data_limite ? String(args.data_limite) : null,
    xp_recompensa: 10,
    tags: [],
    ordem: 0,
  })

  if (error) {
    return { sucesso: false, mensagem: `Erro ao criar tarefa: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Tarefa "${titulo}" criada com sucesso na coluna A Fazer!` }
}

async function editarTarefa(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const tarefaId = String(args.tarefa_id ?? '')
  if (!tarefaId) {
    return { sucesso: false, mensagem: 'ID da tarefa e obrigatorio' }
  }

  const updates: Record<string, unknown> = {}
  if (args.titulo) updates.titulo = String(args.titulo)
  if (args.prioridade) updates.prioridade = String(args.prioridade)
  if (args.coluna) updates.coluna = String(args.coluna)
  if (args.descricao !== undefined) updates.descricao = args.descricao ? String(args.descricao) : null
  if (args.data_limite !== undefined) updates.data_limite = args.data_limite ? String(args.data_limite) : null

  if (Object.keys(updates).length === 0) {
    return { sucesso: false, mensagem: 'Nenhum campo para atualizar' }
  }

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', tarefaId)
    .eq('user_id', userId)

  if (error) {
    return { sucesso: false, mensagem: `Erro ao editar tarefa: ${error.message}` }
  }

  const campos = Object.keys(updates).join(', ')
  return { sucesso: true, mensagem: `Tarefa atualizada (${campos})!` }
}

async function excluirTarefa(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const tarefaId = String(args.tarefa_id ?? '')
  if (!tarefaId) {
    return { sucesso: false, mensagem: 'ID da tarefa e obrigatorio' }
  }

  const { data: tarefa } = await supabase
    .from('tasks')
    .select('titulo')
    .eq('id', tarefaId)
    .eq('user_id', userId)
    .single()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', tarefaId)
    .eq('user_id', userId)

  if (error) {
    return { sucesso: false, mensagem: `Erro ao excluir tarefa: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Tarefa "${tarefa?.titulo ?? tarefaId}" excluida!` }
}

async function concluirTarefa(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const tarefaId = String(args.tarefa_id ?? '')
  if (!tarefaId) {
    return { sucesso: false, mensagem: 'ID da tarefa e obrigatorio' }
  }

  const { data: tarefa } = await supabase
    .from('tasks')
    .select('titulo, xp_recompensa')
    .eq('id', tarefaId)
    .eq('user_id', userId)
    .single()

  const { error } = await supabase
    .from('tasks')
    .update({
      coluna: 'concluido',
      status: 'concluido',
      concluida_em: new Date().toISOString(),
    })
    .eq('id', tarefaId)
    .eq('user_id', userId)

  if (error) {
    return { sucesso: false, mensagem: `Erro ao concluir tarefa: ${error.message}` }
  }

  if (tarefa?.xp_recompensa) {
    await supabase.rpc('add_user_xp', {
      p_user_id: userId,
      p_xp_amount: tarefa.xp_recompensa,
    })
  }

  return {
    sucesso: true,
    mensagem: `Tarefa "${tarefa?.titulo ?? tarefaId}" concluida! +${tarefa?.xp_recompensa ?? 10} XP`,
  }
}

async function criarHabito(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const titulo = String(args.titulo ?? '').trim()
  if (!titulo) {
    return { sucesso: false, mensagem: 'Titulo do habito e obrigatorio' }
  }

  const { error } = await supabase.from('habits').insert({
    user_id: userId,
    titulo,
    descricao: args.descricao ? String(args.descricao) : null,
    frequencia: String(args.frequencia ?? 'diario'),
    dias_semana: [1, 2, 3, 4, 5, 6, 0],
    ativo: true,
    ordem: 0,
  })

  if (error) {
    return { sucesso: false, mensagem: `Erro ao criar habito: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Habito "${titulo}" criado com sucesso!` }
}

async function editarHabito(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const habitoId = String(args.habito_id ?? '')
  if (!habitoId) {
    return { sucesso: false, mensagem: 'ID do habito e obrigatorio' }
  }

  const updates: Record<string, unknown> = {}
  if (args.titulo) updates.titulo = String(args.titulo)
  if (args.frequencia) updates.frequencia = String(args.frequencia)
  if (args.descricao !== undefined) updates.descricao = args.descricao ? String(args.descricao) : null

  if (Object.keys(updates).length === 0) {
    return { sucesso: false, mensagem: 'Nenhum campo para atualizar' }
  }

  const { error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitoId)
    .eq('user_id', userId)

  if (error) {
    return { sucesso: false, mensagem: `Erro ao editar habito: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Habito atualizado!` }
}

async function excluirHabito(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const habitoId = String(args.habito_id ?? '')
  if (!habitoId) {
    return { sucesso: false, mensagem: 'ID do habito e obrigatorio' }
  }

  const { data: habito } = await supabase
    .from('habits')
    .select('titulo')
    .eq('id', habitoId)
    .eq('user_id', userId)
    .single()

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitoId)
    .eq('user_id', userId)

  if (error) {
    return { sucesso: false, mensagem: `Erro ao excluir habito: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Habito "${habito?.titulo ?? habitoId}" excluido!` }
}

async function marcarHabito(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const habitoId = String(args.habito_id ?? '')
  if (!habitoId) {
    return { sucesso: false, mensagem: 'ID do habito e obrigatorio' }
  }

  const { data, error } = await supabase.rpc('check_habit', {
    p_habit_id: habitoId,
    p_user_id: userId,
  })

  if (error) {
    return { sucesso: false, mensagem: `Erro ao marcar habito: ${error.message}` }
  }

  const result = Array.isArray(data) ? data[0] : data
  if (result?.xp_ganho === 0) {
    return { sucesso: true, mensagem: 'Habito ja estava marcado como feito hoje.' }
  }

  return {
    sucesso: true,
    mensagem: `Habito marcado como feito! +${result?.xp_ganho ?? 15} XP | Streak: ${result?.streak_atual ?? 1} dias`,
  }
}

async function criarMeta(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const titulo = String(args.titulo ?? '').trim()
  if (!titulo) {
    return { sucesso: false, mensagem: 'Titulo da meta e obrigatorio' }
  }

  const { error } = await supabase.from('goals').insert({
    user_id: userId,
    titulo,
    descricao: args.descricao ? String(args.descricao) : null,
    progresso_total: Number(args.progresso_total ?? 100),
    unidade: args.unidade ? String(args.unidade) : 'unidades',
    status: 'a_fazer',
    xp_recompensa: 100,
  })

  if (error) {
    return { sucesso: false, mensagem: `Erro ao criar meta: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Meta "${titulo}" criada com sucesso!` }
}

async function editarMeta(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const metaId = String(args.meta_id ?? '')
  if (!metaId) {
    return { sucesso: false, mensagem: 'ID da meta e obrigatorio' }
  }

  const updates: Record<string, unknown> = {}
  if (args.titulo) updates.titulo = String(args.titulo)
  if (args.progresso_atual !== undefined) updates.progresso_atual = Number(args.progresso_atual)
  if (args.status) updates.status = String(args.status)

  if (Object.keys(updates).length === 0) {
    return { sucesso: false, mensagem: 'Nenhum campo para atualizar' }
  }

  const { error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', metaId)
    .eq('user_id', userId)

  if (error) {
    return { sucesso: false, mensagem: `Erro ao editar meta: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Meta atualizada!` }
}

async function excluirMeta(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const metaId = String(args.meta_id ?? '')
  if (!metaId) {
    return { sucesso: false, mensagem: 'ID da meta e obrigatorio' }
  }

  const { data: meta } = await supabase
    .from('goals')
    .select('titulo')
    .eq('id', metaId)
    .eq('user_id', userId)
    .single()

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', metaId)
    .eq('user_id', userId)

  if (error) {
    return { sucesso: false, mensagem: `Erro ao excluir meta: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Meta "${meta?.titulo ?? metaId}" excluida!` }
}

async function criarPendencia(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const titulo = String(args.titulo ?? '').trim()
  if (!titulo) {
    return { sucesso: false, mensagem: 'Titulo da pendencia e obrigatorio' }
  }

  const { error } = await supabase.from('pending_items').insert({
    user_id: userId,
    titulo,
    descricao: args.descricao ? String(args.descricao) : null,
    prioridade: String(args.prioridade ?? 'media'),
  })

  if (error) {
    return { sucesso: false, mensagem: `Erro ao criar pendencia: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Pendencia "${titulo}" criada!` }
}

function agendarFoco(args: Record<string, unknown>): FunctionCallResult {
  const duracao = Number(args.duracao_minutos ?? 25)
  const modo = String(args.modo ?? 'pomodoro')

  return {
    sucesso: true,
    mensagem: `Sessao de foco sugerida: ${duracao}min no modo ${modo}. Acesse a pagina /foco para iniciar.`,
  }
}
