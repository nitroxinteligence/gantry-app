'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import type { Conversa, Mensagem } from '@/lib/supabase/types'

const CONVERSAS_KEY = ['conversas']
const MENSAGENS_KEY = ['mensagens']

// ==========================================
// Fetch functions
// ==========================================

async function fetchConversas(userId: string): Promise<Conversa[]> {
  const { data, error } = await supabase
    .from('conversas')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar conversas: ${error.message}`)
  }
  return (data ?? []) as Conversa[]
}

async function fetchMensagens(conversaId: string): Promise<Mensagem[]> {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .eq('conversa_id', conversaId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Erro ao buscar mensagens: ${error.message}`)
  }
  return (data ?? []) as Mensagem[]
}

// ==========================================
// Query hooks
// ==========================================

export function useConversas() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...CONVERSAS_KEY, user?.id],
    queryFn: () => fetchConversas(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  })
}

export function useMensagens(conversaId: string | undefined) {
  return useQuery({
    queryKey: [...MENSAGENS_KEY, conversaId],
    queryFn: () => fetchMensagens(conversaId!),
    enabled: !!conversaId,
    staleTime: 1000 * 60,
  })
}

// ==========================================
// Mutation hooks
// ==========================================

export function useCreateConversa() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (titulo?: string) => {
      if (!user?.id) {
        throw new Error('Usuario nao autenticado')
      }
      const { data, error } = await supabase
        .from('conversas')
        .insert({
          user_id: user.id,
          titulo: titulo ?? 'Nova conversa',
          ultima_mensagem: null,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao criar conversa: ${error.message}`)
      }
      return data as Conversa
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSAS_KEY })
    },
    onError: (error) => {
      toast.error('Erro ao criar conversa', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useDeleteConversa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('conversas').delete().eq('id', id)
      if (error) {
        throw new Error(`Erro ao deletar conversa: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSAS_KEY })
      toast.success('Conversa excluida')
    },
    onError: (error) => {
      toast.error('Erro ao excluir conversa', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

// ==========================================
// Streaming chat hook
// ==========================================

interface StreamState {
  isStreaming: boolean
  respostaParcial: string
}

export function useEnviarMensagem(conversaId: string | undefined) {
  const queryClient = useQueryClient()
  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    respostaParcial: '',
  })
  const abortRef = useRef<AbortController | null>(null)

  const enviar = useCallback(async (mensagem: string, historico: { id: string; autor: string; conteudo: string }[]) => {
    if (!conversaId || !mensagem.trim()) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreamState({ isStreaming: true, respostaParcial: '' })

    try {
      const response = await fetch('/api/assistente/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversaId,
          mensagem: mensagem.trim(),
          historico: historico.map(m => ({
            id: m.id,
            autor: m.autor,
            conteudo: m.conteudo,
          })),
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(err.error ?? `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Stream nao disponivel')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.tipo === 'texto') {
              setStreamState(prev => ({
                ...prev,
                respostaParcial: prev.respostaParcial + parsed.conteudo,
              }))
            } else if (parsed.tipo === 'acao') {
              setStreamState(prev => ({
                ...prev,
                respostaParcial: prev.respostaParcial + parsed.conteudo,
              }))
              // Invalidar todas as queries que podem ter sido afetadas pelas acoes do assistente
              queryClient.invalidateQueries({ queryKey: ['tarefas'] })
              queryClient.invalidateQueries({ queryKey: ['habitos'] })
              queryClient.invalidateQueries({ queryKey: ['metas'] })
              queryClient.invalidateQueries({ queryKey: ['pendencias'] })
              queryClient.invalidateQueries({ queryKey: ['foco'] })
              queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            }
          } catch {
            // Ignorar linhas que nao sao JSON valido
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      toast.error('Erro ao enviar mensagem', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    } finally {
      setStreamState(prev => ({ ...prev, isStreaming: false }))
      queryClient.invalidateQueries({ queryKey: [...MENSAGENS_KEY, conversaId] })
      queryClient.invalidateQueries({ queryKey: CONVERSAS_KEY })
    }
  }, [conversaId, queryClient])

  const cancelar = useCallback(() => {
    abortRef.current?.abort()
    setStreamState({ isStreaming: false, respostaParcial: '' })
  }, [])

  return { enviar, cancelar, ...streamState }
}

// ==========================================
// Morning briefing hook
// ==========================================

export function useBriefingMatinal() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['briefing-matinal', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/assistente/briefing')
      if (!response.ok) {
        throw new Error('Erro ao buscar briefing')
      }
      const data = await response.json()
      return data.briefing as string
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  })
}
