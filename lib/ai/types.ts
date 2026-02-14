export interface MensagemChat {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface ContextoUsuario {
  tarefasHoje: ResumoPorCategoria[]
  habitosAtivos: ResumoHabito[]
  focoHoje: ResumoFoco
  eventosHoje: ResumoEvento[]
  metasAtivas: ResumoMeta[]
  usuario: ResumoUsuario
}

export interface ResumoPorCategoria {
  titulo: string
  prioridade: string
  coluna: string
  dataLimite: string | null
}

export interface ResumoHabito {
  titulo: string
  streakAtual: number
  frequencia: string
  concluídoHoje: boolean
}

export interface ResumoFoco {
  sessoesDia: number
  minutosDia: number
  sessoesSemana: number
  minutosSemana: number
}

export interface ResumoEvento {
  titulo: string
  horarioInicio: string
  horarioFim: string
  categoria: string
}

export interface ResumoMeta {
  titulo: string
  progressoAtual: number
  progressoTotal: number
  status: string
}

export interface ResumoUsuario {
  nome: string
  nivel: number
  xpTotal: number
  streakAtual: number
}

export type AcaoAssistente =
  | { tipo: 'criar_tarefa'; dados: { titulo: string; prioridade?: string; dataLimite?: string } }
  | { tipo: 'criar_habito'; dados: { titulo: string; frequencia?: string } }
  | { tipo: 'agendar_foco'; dados: { duracao: number; modo?: string } }
  | { tipo: 'concluir_tarefa'; dados: { tarefaId: string } }
  | { tipo: 'marcar_habito'; dados: { habitoId: string } }

export interface RespostaStream {
  tipo: 'texto' | 'acao' | 'erro'
  conteudo: string
  acao?: AcaoAssistente
}
