// ==========================================
// TIPOS DA AREA ADMIN
// ==========================================

export interface AdminUser {
  id: string
  user_id: string
  role: 'ultra-admin'
  created_at: string
}

// ==========================================
// ANALYTICS
// ==========================================

export interface AdminAnalytics {
  total_usuarios: number
  usuarios_ativos_7d: number
  usuarios_ativos_30d: number
  xp_medio: number
  nivel_medio: number
  total_tarefas_concluidas: number
  total_sessoes_foco: number
  total_habitos_ativos: number
  streak_medio: number
  total_cursos_publicados: number
  total_aulas_concluidas: number
  novos_usuarios_7d: number
  novos_usuarios_30d: number
}

// ==========================================
// USER MANAGEMENT
// ==========================================

export interface UsuarioAdmin {
  id: string
  email: string
  name: string
  avatar_url: string | null
  total_xp: number
  level: number
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
  bloqueado: boolean
}

// ==========================================
// COURSE ADMIN
// ==========================================

export interface CursoAdmin {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  categoria: string
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  imagem_url: string | null
  destaque: boolean
  status: 'rascunho' | 'publicado' | 'arquivado'
  ordem: number
  created_at: string
  updated_at: string
  total_modulos?: number
  total_aulas?: number
}

export interface ModuloAdmin {
  id: string
  course_id: string
  titulo: string
  descricao: string | null
  ordem: number
  created_at: string
  updated_at: string
  aulas?: AulaAdmin[]
}

export interface AulaAdmin {
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

// ==========================================
// VIDEO EMBED
// ==========================================

export type VideoProvider = 'youtube' | 'vimeo' | 'pandavideo' | 'unknown'

export interface VideoEmbed {
  provider: VideoProvider
  url: string
  embedUrl: string
}

// ==========================================
// NOTIFICATION ADMIN
// ==========================================

export interface NotificacaoMassa {
  titulo: string
  mensagem: string
  tipo: 'sistema' | 'conquista' | 'lembrete' | 'tarefa' | 'habito' | 'foco' | 'curso'
}

// ==========================================
// API RESPONSES
// ==========================================

export interface AdminApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
