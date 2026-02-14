export interface MensagemChat {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface ContextoUsuario {
  usuario: ResumoUsuario
  tarefas: ResumoTarefa[]
  pendencias: ResumoPendencia[]
  habitosAtivos: ResumoHabito[]
  categoriasHabito: ResumoCategoriaHabito[]
  focoHoje: ResumoFoco
  metasAtivas: ResumoMeta[]
  objetivosDesenvolvimento: ResumoObjetivo[]
  analisePerformance: AnalisePerformance
}

export interface ResumoTarefa {
  id: string
  titulo: string
  descricao: string | null
  prioridade: string
  status: string
  coluna: string
  dataLimite: string | null
  tags: string[]
  tempoGasto: number
  xpRecompensa: number
}

export interface ResumoPendencia {
  id: string
  titulo: string
  descricao: string | null
  prioridade: string
  categoria: string | null
  dataVencimento: string | null
}

export interface ResumoHabito {
  id: string
  titulo: string
  descricao: string | null
  streakAtual: number
  maiorStreak: number
  frequencia: string
  diasSemana: number[]
  xpPorCheck: number
  categoriaId: string | null
  concluidoHoje: boolean
}

export interface ResumoCategoriaHabito {
  id: string
  titulo: string
  icone: string
  cor: string
}

export interface ResumoFoco {
  sessoesDia: number
  minutosDia: number
  sessoesSemana: number
  minutosSemana: number
  totalSessoes: number
  totalMinutos: number
  mediaMinutosPorSessao: number
  xpTotalFoco: number
}

export interface ResumoMeta {
  id: string
  titulo: string
  descricao: string | null
  progressoAtual: number
  progressoTotal: number
  unidade: string
  status: string
  prazo: string | null
  xpRecompensa: number
}

export interface ResumoObjetivo {
  id: string
  titulo: string
  descricao: string | null
  categoria: string
  progressoAtual: number
  progressoTotal: number
  status: string
  habitosChave: string[]
  xpRecompensa: number
}

export interface ResumoUsuario {
  nome: string
  email: string
  nivel: number
  xpTotal: number
  streakAtual: number
  maiorStreak: number
  streakShields: number
  avatarUrl: string | null
  criadoEm: string
}

export interface AnalisePerformance {
  tarefasConcluidasUltimos7Dias: number
  tarefasTotalAtivas: number
  taxaConclusaoTarefas: number
  habitosConcluidosHoje: number
  habitosTotalAtivos: number
  taxaConclusaoHabitos: number
  focoMinutosHoje: number
  focoMinutosSemana: number
  focoMediaDiaria: number
  metasEmAndamento: number
  metasConcluidas: number
  streakDias: number
  nivelProgresso: number
}

export type AcaoAssistente =
  | { tipo: 'criar_tarefa'; dados: { titulo: string; prioridade?: string; dataLimite?: string; descricao?: string } }
  | { tipo: 'editar_tarefa'; dados: { tarefaId: string; titulo?: string; prioridade?: string; coluna?: string; descricao?: string } }
  | { tipo: 'excluir_tarefa'; dados: { tarefaId: string } }
  | { tipo: 'concluir_tarefa'; dados: { tarefaId: string } }
  | { tipo: 'criar_habito'; dados: { titulo: string; frequencia?: string; descricao?: string } }
  | { tipo: 'editar_habito'; dados: { habitoId: string; titulo?: string; frequencia?: string; descricao?: string } }
  | { tipo: 'excluir_habito'; dados: { habitoId: string } }
  | { tipo: 'marcar_habito'; dados: { habitoId: string } }
  | { tipo: 'criar_meta'; dados: { titulo: string; descricao?: string; progressoTotal?: number; unidade?: string } }
  | { tipo: 'editar_meta'; dados: { metaId: string; titulo?: string; progressoAtual?: number; status?: string } }
  | { tipo: 'excluir_meta'; dados: { metaId: string } }
  | { tipo: 'criar_pendencia'; dados: { titulo: string; prioridade?: string; descricao?: string } }
  | { tipo: 'agendar_foco'; dados: { duracao: number; modo?: string } }
  | { tipo: 'analisar_performance'; dados: Record<string, never> }

export interface RespostaStream {
  tipo: 'texto' | 'acao' | 'erro'
  conteudo: string
  acao?: AcaoAssistente
}
