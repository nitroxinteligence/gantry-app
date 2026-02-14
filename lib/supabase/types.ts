// ============================================================================
// BUILDERS PERFORMANCE - TIPOS DO BANCO DE DADOS
// ============================================================================
// Arquivo consolidado de tipos TypeScript derivados do schema PostgreSQL.
// Fonte única de verdade — TODO: substituir por `supabase gen types typescript`
// quando acesso ao banco for restabelecido.
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ==========================================
// ENUMS DO BANCO DE DADOS
// ==========================================

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente'
export type TaskStatus = 'pendente' | 'em_progresso' | 'em_revisao' | 'concluido'
export type KanbanColumn = 'backlog' | 'a_fazer' | 'em_andamento' | 'concluido'
export type FocusMode = 'pomodoro' | 'deep_work' | 'flowtime' | 'custom'
export type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled'
export type GoalStatus = 'a_fazer' | 'em_andamento' | 'concluido'
export type ObjectiveCategory = 'pessoal' | 'profissional' | 'estudos' | 'saude' | 'financeiro'
export type EventStatus = 'confirmado' | 'pendente' | 'foco'
export type CalendarIntegration = 'Manual' | 'Google' | 'Outlook'
export type CourseLevel = 'iniciante' | 'intermediario' | 'avancado'
export type CourseStatus = 'rascunho' | 'publicado' | 'arquivado'

// Aliases em português (usados pelos hooks e páginas)
export type Prioridade = TaskPriority
export type PrioridadeSimples = 'baixa' | 'media' | 'alta'
export type StatusTarefa = TaskStatus
export type ColunaKanban = KanbanColumn
export type DificuldadeHabito = 'facil' | 'medio' | 'dificil'
export type FrequenciaHabito = 'diario' | 'semanal'
export type StatusObjetivo = 'backlog' | 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluido'
export type StatusMeta = 'nao_iniciada' | 'em_andamento' | 'pausada' | 'atrasada' | 'concluida'
export type Visibilidade = 'publica' | 'privada'

// Alias para compatibilidade (deprecated - usar ColunaKanban)
export type Estagio = ColunaKanban

// ==========================================
// INTERFACES - TABELAS CORE
// ==========================================

export interface Usuario {
  id: string
  email: string
  name: string
  avatar_url: string | null
  total_xp: number
  level: number
  streak_shields: number
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export interface Tarefa {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  status: StatusTarefa
  coluna: ColunaKanban
  data_limite: string | null
  xp_recompensa: number
  projeto_id: string | null
  tags: string[]
  estimativa_tempo: number | null
  tempo_gasto: number
  ordem: number
  concluida_em: string | null
  created_at: string
  updated_at: string
}

export interface Pendencia {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  categoria: string | null
  prazo: string | null
  data_vencimento: string | null
  created_at: string
  updated_at: string
}

// ==========================================
// INTERFACES - FOCO
// ==========================================

export interface FocusPause {
  started_at: string
  ended_at: string | null
  duration: number
}

export interface FocusSession {
  id: string
  user_id: string
  task_id: string | null
  modo: FocusMode
  duracao_planejada: number
  duracao_real: number
  xp_ganho: number
  started_at: string
  ended_at: string | null
  pausas: FocusPause[]
  status: SessionStatus
  created_at: string
}

export interface FocusSessionWithTask extends FocusSession {
  task_titulo: string | null
  task_prioridade: TaskPriority | null
  task_coluna: KanbanColumn | null
}

export interface FocusStats {
  totalSessions: number
  totalSeconds: number
  totalXp: number
  averageSessionSeconds: number
  sessionsToday: number
  secondsToday: number
  sessionsThisWeek: number
  secondsThisWeek: number
}

export interface CompleteFocusSessionResult {
  sessionId: string
  xpEarned: number
  newTotalXp: number
  newLevel: number
  levelUp: boolean
}

// ==========================================
// INTERFACES - HÁBITOS
// ==========================================

export interface CategoriaHabito {
  id: string
  user_id: string
  nome: string
  descricao: string | null
  icone: string
  cor: string
  ordem: string
  created_at: string
  updated_at: string
}

export interface Habito {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  icone: string
  cor: string | null
  dificuldade: DificuldadeHabito
  frequencia: FrequenciaHabito
  dias_semana: number[]
  categoria_id: string | null
  objetivo_id: string | null
  ordem: string
  ativo: boolean
  streak_atual: number
  maior_streak: number
  total_conclusoes: number
  created_at: string
  updated_at: string
}

export interface HistoricoHabito {
  id: string
  user_id: string
  habito_id: string
  data: string
  concluido: boolean
  horario: string | null
  created_at: string
}

// ==========================================
// INTERFACES - METAS E OBJETIVOS
// ==========================================

export interface ColunaObjetivo {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  icone: string
  cor: string
  ordem: string
  created_at: string
  updated_at: string
}

export interface Objetivo {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  progresso_atual: number
  progresso_total: number
  status: StatusObjetivo
  cor: string | null
  tags: string[]
  data_inicio: string | null
  data_fim: string | null
  prioridade: PrioridadeSimples
  arquivado: boolean
  coluna_id: string | null
  meta_id: string | null
  ordem: string
  created_at: string
  updated_at: string
}

export interface Meta {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  progresso_atual: number
  progresso_total: number
  status: StatusMeta
  categoria: string | null
  cor: string
  icone: string
  tags: string[]
  ano: number
  trimestre: number | null
  data_inicio: string | null
  data_fim: string | null
  prioridade: PrioridadeSimples
  visibilidade: Visibilidade
  notas_progresso: string | null
  ordem: string
  created_at: string
  updated_at: string
}

export interface MarcoMeta {
  id: string
  meta_id: string
  titulo: string
  descricao: string | null
  concluido: boolean
  data_conclusao: string | null
  ordem: number
  created_at: string
  updated_at: string
}

// ==========================================
// INTERFACES - ASSISTENTE IA
// ==========================================

export type AutorMensagem = 'usuario' | 'assistente'

export interface Conversa {
  id: string
  user_id: string
  titulo: string
  ultima_mensagem: string | null
  created_at: string
  updated_at: string
}

export interface Mensagem {
  id: string
  conversa_id: string
  autor: AutorMensagem
  conteudo: string
  metadata: Json
  created_at: string
}

export type ConversaCreate = Omit<Conversa, 'id' | 'created_at' | 'updated_at'>
export type ConversaUpdate = Partial<Pick<Conversa, 'titulo' | 'ultima_mensagem'>>

export type MensagemCreate = Omit<Mensagem, 'id' | 'created_at'>

// ==========================================
// INTERFACES - NOTIFICACOES
// ==========================================

export type TipoNotificacao = 'sistema' | 'conquista' | 'lembrete' | 'tarefa' | 'habito' | 'foco' | 'curso'

export interface Notificacao {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  tipo: TipoNotificacao
  lida: boolean
  created_at: string
}

export type NotificacaoCreate = Omit<Notificacao, 'id' | 'created_at'>
export type NotificacaoUpdate = Partial<Pick<Notificacao, 'lida'>>

// ==========================================
// INTERFACES - EVENTOS
// ==========================================

export interface Evento {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  data: string
  horario_inicio: string
  horario_fim: string
  categoria: string
  local: string | null
  status: EventStatus
  calendario: CalendarIntegration
  external_event_id: string | null
  created_at: string
  updated_at: string
}

// ==========================================
// INTERFACES - CALENDAR CONNECTIONS
// ==========================================

export type CalendarProvider = 'Google' | 'Outlook'

export interface ConexaoCalendario {
  id: string
  user_id: string
  provider: CalendarProvider
  access_token: string
  refresh_token: string
  token_expires_at: string
  scopes: string[]
  external_email: string | null
  is_active: boolean
  last_sync_at: string | null
  sync_token: string | null
  created_at: string
  updated_at: string
}

// ==========================================
// INTERFACES - CURSOS
// ==========================================

export interface Curso {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  categoria: string
  nivel: CourseLevel
  imagem_url: string | null
  destaque: boolean
  status: CourseStatus
  ordem: number
  created_at: string
  updated_at: string
}

export interface ModuloCurso {
  id: string
  course_id: string
  titulo: string
  descricao: string | null
  ordem: number
  created_at: string
  updated_at: string
}

export interface Aula {
  id: string
  module_id: string
  titulo: string
  descricao: string | null
  duracao_segundos: number
  xp_recompensa: number
  video_url: string | null
  ordem: number
  created_at: string
  updated_at: string
}

export interface ProgressoAula {
  id: string
  user_id: string
  lesson_id: string
  concluida: boolean
  xp_ganho: number
  concluida_em: string | null
  created_at: string
  updated_at: string
}

// ==========================================
// TIPOS DERIVADOS (Create / Update)
// ==========================================

export type TarefaCreate = Omit<Tarefa, 'id' | 'created_at' | 'updated_at' | 'concluida_em' | 'tempo_gasto'> & {
  tempo_gasto?: number
}
export type TarefaUpdate = Partial<Omit<Tarefa, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type PendenciaCreate = Omit<Pendencia, 'id' | 'created_at' | 'updated_at'>
export type PendenciaUpdate = Partial<Omit<Pendencia, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type CategoriaHabitoCreate = Omit<CategoriaHabito, 'id' | 'created_at' | 'updated_at'>
export type CategoriaHabitoUpdate = Partial<Omit<CategoriaHabito, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type HabitoCreate = Omit<Habito, 'id' | 'created_at' | 'updated_at' | 'streak_atual' | 'maior_streak' | 'total_conclusoes'>
export type HabitoUpdate = Partial<Omit<Habito, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type HistoricoHabitoCreate = Omit<HistoricoHabito, 'id' | 'created_at'>

export type ColunaObjetivoCreate = Omit<ColunaObjetivo, 'id' | 'created_at' | 'updated_at'>
export type ColunaObjetivoUpdate = Partial<Omit<ColunaObjetivo, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type ObjetivoCreate = Omit<Objetivo, 'id' | 'created_at' | 'updated_at'>
export type ObjetivoUpdate = Partial<Omit<Objetivo, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type MetaCreate = Omit<Meta, 'id' | 'created_at' | 'updated_at'>
export type MetaUpdate = Partial<Omit<Meta, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type MarcoMetaCreate = Omit<MarcoMeta, 'id' | 'created_at' | 'updated_at'>
export type MarcoMetaUpdate = Partial<Omit<MarcoMeta, 'id' | 'created_at' | 'updated_at' | 'meta_id'>>

// ==========================================
// DATABASE INTERFACE (Supabase)
// ==========================================
// TODO: Regenerar com `supabase gen types typescript` quando acesso ao
// banco for restabelecido. Este tipo manual cobre as tabelas conhecidas.

export interface Database {
  public: {
    Tables: {
      users: {
        Row: Usuario
        Insert: Omit<Usuario, 'created_at' | 'updated_at'> & {
          id?: string
          total_xp?: number
          level?: number
          streak_shields?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Usuario, 'id'>>
        Relationships: []
      }
      tasks: {
        Row: Tarefa
        Insert: Omit<Tarefa, 'id' | 'created_at' | 'updated_at' | 'concluida_em' | 'tempo_gasto'> & {
          id?: string
          created_at?: string
          updated_at?: string
          concluida_em?: string | null
          tempo_gasto?: number
        }
        Update: Partial<Omit<Tarefa, 'id' | 'user_id'>>
        Relationships: [
          {
            foreignKeyName: 'tasks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      pending_items: {
        Row: Pendencia
        Insert: Omit<Pendencia, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Pendencia, 'id' | 'user_id'>>
        Relationships: [
          {
            foreignKeyName: 'pending_items_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      focus_sessions: {
        Row: FocusSession
        Insert: Omit<FocusSession, 'id' | 'created_at' | 'duracao_real' | 'xp_ganho'> & {
          id?: string
          duracao_real?: number
          xp_ganho?: number
          created_at?: string
        }
        Update: Partial<Omit<FocusSession, 'id' | 'user_id'>>
        Relationships: [
          {
            foreignKeyName: 'focus_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      habits: {
        Row: Habito
        Insert: Omit<Habito, 'id' | 'created_at' | 'updated_at' | 'streak_atual' | 'maior_streak' | 'total_conclusoes'> & {
          id?: string
          streak_atual?: number
          maior_streak?: number
          total_conclusoes?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Habito, 'id' | 'user_id'>>
        Relationships: []
      }
      habit_categories: {
        Row: CategoriaHabito
        Insert: Omit<CategoriaHabito, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<CategoriaHabito, 'id' | 'user_id'>>
        Relationships: []
      }
      habit_checks: {
        Row: HistoricoHabito
        Insert: Omit<HistoricoHabito, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<HistoricoHabito, 'id'>>
        Relationships: []
      }
      goals: {
        Row: Meta
        Insert: Omit<Meta, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Meta, 'id' | 'user_id'>>
        Relationships: []
      }
      objectives: {
        Row: Objetivo
        Insert: Omit<Objetivo, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Objetivo, 'id' | 'user_id'>>
        Relationships: []
      }
      objective_columns: {
        Row: ColunaObjetivo
        Insert: Omit<ColunaObjetivo, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ColunaObjetivo, 'id' | 'user_id'>>
        Relationships: []
      }
      goal_milestones: {
        Row: MarcoMeta
        Insert: Omit<MarcoMeta, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<MarcoMeta, 'id' | 'meta_id'>>
        Relationships: []
      }
      development_objectives: {
        Row: {
          id: string
          user_id: string
          titulo: string
          descricao: string | null
          categoria: ObjectiveCategory
          progresso_atual: number
          progresso_total: number
          status: GoalStatus
          habitos_chave: string[]
          xp_recompensa: number
          concluida_em: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          descricao?: string | null
          categoria?: ObjectiveCategory
          progresso_atual?: number
          progresso_total?: number
          status?: GoalStatus
          habitos_chave?: string[]
          xp_recompensa?: number
          concluida_em?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          titulo?: string
          descricao?: string | null
          categoria?: ObjectiveCategory
          progresso_atual?: number
          progresso_total?: number
          status?: GoalStatus
          habitos_chave?: string[]
          xp_recompensa?: number
          concluida_em?: string | null
        }
        Relationships: []
      }
      conversas: {
        Row: Conversa
        Insert: Omit<Conversa, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Pick<Conversa, 'titulo' | 'ultima_mensagem'>>
        Relationships: [
          {
            foreignKeyName: 'conversas_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      mensagens: {
        Row: Mensagem
        Insert: Omit<Mensagem, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Pick<Mensagem, 'conteudo' | 'metadata'>>
        Relationships: [
          {
            foreignKeyName: 'mensagens_conversa_id_fkey'
            columns: ['conversa_id']
            isOneToOne: false
            referencedRelation: 'conversas'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: Notificacao
        Insert: Omit<Notificacao, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Pick<Notificacao, 'lida'>>
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      events: {
        Row: Evento
        Insert: Omit<Evento, 'id' | 'created_at' | 'updated_at' | 'external_event_id'> & {
          id?: string
          external_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Evento, 'id' | 'user_id'>>
        Relationships: []
      }
      calendar_connections: {
        Row: ConexaoCalendario
        Insert: {
          id?: string
          user_id: string
          provider: CalendarProvider
          access_token: string
          refresh_token: string
          token_expires_at: string
          scopes?: string[]
          external_email?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          sync_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          provider?: CalendarProvider
          access_token?: string
          refresh_token?: string
          token_expires_at?: string
          scopes?: string[]
          external_email?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          sync_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'calendar_connections_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      courses: {
        Row: Curso
        Insert: Omit<Curso, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Curso, 'id'>>
        Relationships: []
      }
      course_modules: {
        Row: ModuloCurso
        Insert: Omit<ModuloCurso, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ModuloCurso, 'id'>>
        Relationships: []
      }
      lessons: {
        Row: Aula
        Insert: Omit<Aula, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Aula, 'id'>>
        Relationships: []
      }
      lesson_progress: {
        Row: ProgressoAula
        Insert: Omit<ProgressoAula, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ProgressoAula, 'id'>>
        Relationships: []
      }
    }
    Views: {
      focus_sessions_with_task: {
        Row: FocusSessionWithTask
      }
    }
    Functions: {
      add_user_xp: {
        Args: { p_user_id: string; p_xp_amount: number }
        Returns: { new_total_xp: number; new_level: number; level_up: boolean }[]
      }
      calculate_focus_xp: {
        Args: { duration_seconds: number }
        Returns: number
      }
      calculate_level: {
        Args: { xp: number }
        Returns: number
      }
      complete_focus_session: {
        Args: { p_session_id: string; p_duration_real: number; p_ended_at?: string }
        Returns: { session_id: string; xp_earned: number; new_total_xp: number; new_level: number; level_up: boolean }[]
      }
      get_focus_stats: {
        Args: { p_user_id: string }
        Returns: { total_sessions: number; total_seconds: number; total_xp: number; average_session_seconds: number; sessions_today: number; seconds_today: number; sessions_this_week: number; seconds_this_week: number }[]
      }
      cancel_active_sessions: {
        Args: { p_user_id: string }
        Returns: number
      }
      add_task_time: {
        Args: { p_task_id: string; p_minutes: number }
        Returns: number
      }
      check_habit: {
        Args: { p_habit_id: string; p_user_id: string; p_date?: string }
        Returns: { streak_atual: number; xp_ganho: number; new_total_xp: number; new_level: number; level_up: boolean }[]
      }
      get_habit_streak: {
        Args: { p_habit_id: string }
        Returns: number
      }
      complete_lesson: {
        Args: { p_user_id: string; p_lesson_id: string }
        Returns: { xp_ganho: number; new_total_xp: number; new_level: number; level_up: boolean }[]
      }
      get_course_progress: {
        Args: { p_user_id: string; p_course_id: string }
        Returns: { total_aulas: number; aulas_concluidas: number; progresso_percentual: number }[]
      }
    }
    Enums: {
      task_priority: TaskPriority
      task_status: TaskStatus
      kanban_column: KanbanColumn
      focus_mode: FocusMode
      session_status: SessionStatus
      goal_status: GoalStatus
      objective_category: ObjectiveCategory
      event_status: EventStatus
      calendar_integration: CalendarIntegration
      course_level: CourseLevel
      course_status: CourseStatus
      notification_type: TipoNotificacao
    }
    CompositeTypes: Record<string, never>
  }
}

// ==========================================
// ALIASES SUPABASE (convenience)
// ==========================================

export type User = Usuario
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Task = Tarefa
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type FocusSessionInsert = Database['public']['Tables']['focus_sessions']['Insert']
export type FocusSessionUpdate = Database['public']['Tables']['focus_sessions']['Update']

// ==========================================
// MAPAS DE DISPLAY
// ==========================================

export const focusModeMap: Record<string, FocusMode> = {
  pomodoro: 'pomodoro',
  'deep-work': 'deep_work',
  flowtime: 'flowtime',
  custom: 'custom',
}

export const focusModeReverseMap: Record<FocusMode, string> = {
  pomodoro: 'pomodoro',
  deep_work: 'deep-work',
  flowtime: 'flowtime',
  custom: 'custom',
}

export const kanbanColumnNames: Record<KanbanColumn, string> = {
  backlog: 'Backlog',
  a_fazer: 'A fazer',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

export const priorityNames: Record<TaskPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}
