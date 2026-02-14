import { z } from 'zod'

export const mensagemHistoricoSchema = z.object({
  id: z.string(),
  autor: z.enum(['usuario', 'assistente']),
  conteudo: z.string(),
})

export const chatRequestSchema = z.object({
  conversaId: z.string().uuid('ID de conversa invalido'),
  mensagem: z.string().min(1, 'Mensagem nao pode ser vazia').max(10000, 'Mensagem muito longa'),
  historico: z.array(mensagemHistoricoSchema).default([]),
})

export const conversaCreateSchema = z.object({
  titulo: z.string().min(1).max(200).default('Nova conversa'),
  user_id: z.string().uuid('ID de usuario invalido'),
})

export type ChatRequestInput = z.infer<typeof chatRequestSchema>
export type ConversaCreateInput = z.infer<typeof conversaCreateSchema>
export type MensagemHistorico = z.infer<typeof mensagemHistoricoSchema>
