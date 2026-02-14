import { z } from 'zod'

// ==========================================
// CURSO - CREATE / UPDATE
// ==========================================

export const cursoCreateSchema = z.object({
  titulo: z.string().min(3, 'Titulo deve ter pelo menos 3 caracteres').max(200),
  descricao: z.string().max(2000).nullable().optional(),
  categoria: z.string().min(1, 'Categoria obrigatoria'),
  nivel: z.enum(['iniciante', 'intermediario', 'avancado']),
  imagem_url: z.string().url('URL invalida').nullable().optional(),
  destaque: z.boolean().optional().default(false),
  status: z.enum(['rascunho', 'publicado', 'arquivado']).default('publicado'),
  ordem: z.number().int().min(0).optional().default(0),
})

export const cursoUpdateSchema = cursoCreateSchema.partial()

// ==========================================
// MODULO - CREATE / UPDATE
// ==========================================

export const moduloCreateSchema = z.object({
  course_id: z.string().uuid('ID de curso invalido'),
  titulo: z.string().min(2, 'Titulo deve ter pelo menos 2 caracteres').max(200),
  descricao: z.string().max(1000).nullable().optional(),
  ordem: z.number().int().min(0).optional().default(0),
})

export const moduloUpdateSchema = moduloCreateSchema.partial().omit({ course_id: true })

// ==========================================
// AULA - CREATE / UPDATE
// ==========================================

export const aulaCreateSchema = z.object({
  module_id: z.string().uuid('ID de modulo invalido'),
  titulo: z.string().min(2, 'Titulo deve ter pelo menos 2 caracteres').max(200),
  descricao: z.string().max(2000).nullable().optional(),
  duracao_segundos: z.number().int().min(0).default(0),
  xp_recompensa: z.number().int().min(0).default(10),
  video_url: z.string().url('URL de video invalida').nullable().optional(),
  ordem: z.number().int().min(0).optional().default(0),
})

export const aulaUpdateSchema = aulaCreateSchema.partial().omit({ module_id: true })

// ==========================================
// NOTIFICACAO EM MASSA
// ==========================================

export const notificacaoMassaSchema = z.object({
  titulo: z.string().min(3, 'Titulo deve ter pelo menos 3 caracteres').max(200),
  mensagem: z.string().min(5, 'Mensagem deve ter pelo menos 5 caracteres').max(2000),
  tipo: z.enum(['sistema', 'conquista', 'lembrete', 'tarefa', 'habito', 'foco', 'curso']).default('sistema'),
})

// ==========================================
// USER MANAGEMENT
// ==========================================

export const bloquearUsuarioSchema = z.object({
  user_id: z.string().uuid('ID de usuario invalido'),
  bloqueado: z.boolean(),
})

export const resetarSenhaSchema = z.object({
  user_id: z.string().uuid('ID de usuario invalido'),
})

// ==========================================
// TYPES INFERIDOS
// ==========================================

export type CursoCreateInput = z.infer<typeof cursoCreateSchema>
export type CursoUpdateInput = z.infer<typeof cursoUpdateSchema>
export type ModuloCreateInput = z.infer<typeof moduloCreateSchema>
export type ModuloUpdateInput = z.infer<typeof moduloUpdateSchema>
export type AulaCreateInput = z.infer<typeof aulaCreateSchema>
export type AulaUpdateInput = z.infer<typeof aulaUpdateSchema>
export type NotificacaoMassaInput = z.infer<typeof notificacaoMassaSchema>
