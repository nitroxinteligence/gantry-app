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
  switch (nome) {
    case 'criar_tarefa':
      return criarTarefa(supabase, userId, args)
    case 'criar_habito':
      return criarHabito(supabase, userId, args)
    case 'agendar_foco':
      return agendarFoco(args)
    default:
      return { sucesso: false, mensagem: `Funcao desconhecida: ${nome}` }
  }
}

async function criarTarefa(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const titulo = String(args.titulo ?? '')
  if (!titulo) {
    return { sucesso: false, mensagem: 'Titulo da tarefa e obrigatorio' }
  }

  const { error } = await supabase.from('tasks').insert({
    user_id: userId,
    titulo,
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

  return { sucesso: true, mensagem: `Tarefa "${titulo}" criada com sucesso!` }
}

async function criarHabito(
  supabase: SupabaseClient,
  userId: string,
  args: Record<string, unknown>
): Promise<FunctionCallResult> {
  const titulo = String(args.titulo ?? '')
  if (!titulo) {
    return { sucesso: false, mensagem: 'Titulo do habito e obrigatorio' }
  }

  const { error } = await supabase.from('habits').insert({
    user_id: userId,
    titulo,
    frequencia: String(args.frequencia ?? 'diario'),
    dificuldade: 'medio',
    icone: 'star',
    dias_semana: [1, 2, 3, 4, 5, 6, 0],
    ativo: true,
    ordem: '0',
  })

  if (error) {
    return { sucesso: false, mensagem: `Erro ao criar habito: ${error.message}` }
  }

  return { sucesso: true, mensagem: `Habito "${titulo}" criado com sucesso!` }
}

function agendarFoco(args: Record<string, unknown>): FunctionCallResult {
  const duracao = Number(args.duracao_minutos ?? 25)
  const modo = String(args.modo ?? 'pomodoro')

  return {
    sucesso: true,
    mensagem: `Sessao de foco sugerida: ${duracao}min no modo ${modo}. Acesse a pagina /foco para iniciar.`,
  }
}
