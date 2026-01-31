'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import { tarefaCreateSchema, tarefaUpdateSchema } from '@/lib/schemas/tarefa'
import type { Tarefa, TarefaUpdate, Estagio } from '@/lib/supabase/types'
import type { TarefaCreateInput, TarefaUpdateInput } from '@/lib/schemas/tarefa'

const TAREFAS_KEY = ['tarefas']

async function fetchTarefas(userId: string): Promise<Tarefa[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar tarefas: ${error.message}`)
  }

  return (data || []) as Tarefa[]
}

async function fetchTarefa(id: string): Promise<Tarefa | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Erro ao buscar tarefa: ${error.message}`)
  }

  return data as Tarefa
}

async function createTarefa(input: TarefaCreateInput): Promise<Tarefa> {
  const validated = tarefaCreateSchema.parse(input)

  const { data, error } = await supabase
    .from('tasks')
    .insert(validated)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar tarefa: ${error.message}`)
  }

  return data as Tarefa
}

async function createTarefaWithUserId(
  input: Omit<TarefaCreateInput, 'user_id'>,
  userId: string
): Promise<Tarefa> {
  return createTarefa({ ...input, user_id: userId })
}

async function updateTarefa({
  id,
  data: updateData,
}: {
  id: string
  data: TarefaUpdateInput
}): Promise<Tarefa> {
  const validated = tarefaUpdateSchema.parse(updateData)

  const { data, error } = await supabase
    .from('tasks')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar tarefa: ${error.message}`)
  }

  return data as Tarefa
}

async function deleteTarefa(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar tarefa: ${error.message}`)
  }
}

async function moverTarefa({
  id,
  novoEstagio,
  novaOrdem,
}: {
  id: string
  novoEstagio: Estagio
  novaOrdem: number
}): Promise<Tarefa> {
  const updateData: TarefaUpdate = {
    coluna: novoEstagio,
    ordem: novaOrdem,
  }

  if (novoEstagio === 'concluido') {
    updateData.status = 'concluido'
    updateData.concluida_em = new Date().toISOString()
  } else {
    updateData.concluida_em = null
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao mover tarefa: ${error.message}`)
  }

  return data as Tarefa
}

async function reordenarTarefas(
  tarefas: { id: string; ordem: number; coluna: Estagio }[]
): Promise<void> {
  const promises = tarefas.map(({ id, ordem, coluna }) =>
    supabase
      .from('tasks')
      .update({ ordem, coluna })
      .eq('id', id)
  )

  const results = await Promise.all(promises)
  const errors = results.filter((r: { error: unknown }) => r.error)

  if (errors.length > 0) {
    throw new Error('Erro ao reordenar tarefas')
  }
}

export function useTarefas() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...TAREFAS_KEY, user?.id],
    queryFn: () => fetchTarefas(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export function useTarefa(id: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...TAREFAS_KEY, user?.id, id],
    queryFn: () => (id ? fetchTarefa(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateTarefa() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<TarefaCreateInput, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return createTarefaWithUserId(input, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAREFAS_KEY })
      toast.success('Tarefa criada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar tarefa', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useUpdateTarefa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTarefa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAREFAS_KEY })
      toast.success('Tarefa atualizada!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar tarefa', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useDeleteTarefa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTarefa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAREFAS_KEY })
      toast.success('Tarefa excluída')
    },
    onError: (error) => {
      toast.error('Erro ao excluir tarefa', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useMoverTarefa() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: moverTarefa,
    onMutate: async ({ id, novoEstagio, novaOrdem }) => {
      const queryKey = [...TAREFAS_KEY, user?.id]
      await queryClient.cancelQueries({ queryKey })

      const previousTarefas = queryClient.getQueryData<Tarefa[]>(queryKey)
      const tarefaAnterior = previousTarefas?.find((t) => t.id === id)
      const estagioAnterior = tarefaAnterior?.coluna

      queryClient.setQueryData<Tarefa[]>(queryKey, (old) => {
        if (!old) return old

        return old.map((tarefa) =>
          tarefa.id === id
            ? {
                ...tarefa,
                coluna: novoEstagio,
                ordem: novaOrdem,
                status: novoEstagio === 'concluido' ? 'concluido' : tarefa.status,
                concluida_em:
                  novoEstagio === 'concluido' ? new Date().toISOString() : null,
              }
            : tarefa
        )
      })

      return { previousTarefas, estagioAnterior, queryKey }
    },
    onSuccess: (_data, { novoEstagio }, context) => {
      if (context?.estagioAnterior && context.estagioAnterior !== novoEstagio) {
        toast.success('Tarefa movida!')
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previousTarefas && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousTarefas)
      }
      toast.error('Erro ao mover tarefa', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TAREFAS_KEY })
    },
  })
}

export function useReordenarTarefas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reordenarTarefas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAREFAS_KEY })
    },
  })
}
