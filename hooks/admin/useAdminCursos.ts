'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CursoAdmin, ModuloAdmin, AulaAdmin } from '@/types/admin'
import type { CursoCreateInput, CursoUpdateInput, ModuloCreateInput, ModuloUpdateInput, AulaCreateInput, AulaUpdateInput } from '@/lib/schemas/admin'

// ==========================================
// FETCH FUNCTIONS
// ==========================================

async function fetchCursos(): Promise<CursoAdmin[]> {
  const response = await fetch('/api/admin/courses')
  const json = await response.json()
  if (!response.ok || !json.success) {
    throw new Error(json.error ?? 'Erro ao buscar cursos')
  }
  return json.data
}

async function fetchCursoById(id: string): Promise<CursoAdmin & { modulos: ModuloAdmin[] }> {
  const response = await fetch(`/api/admin/courses/${id}`)
  const json = await response.json()
  if (!response.ok || !json.success) {
    throw new Error(json.error ?? 'Curso nao encontrado')
  }
  return json.data
}

// ==========================================
// HOOKS - CURSOS
// ==========================================

export function useAdminCursos() {
  return useQuery({
    queryKey: ['admin', 'cursos'],
    queryFn: fetchCursos,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAdminCursoById(id: string) {
  return useQuery({
    queryKey: ['admin', 'cursos', id],
    queryFn: () => fetchCursoById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAdminCriarCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CursoCreateInput) => {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao criar curso')
      }
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos'] })
      toast.success('Curso criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar curso', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useAdminAtualizarCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CursoUpdateInput }) => {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao atualizar curso')
      }
      return json.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos', variables.id] })
      toast.success('Curso atualizado!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar curso', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useAdminDeletarCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao deletar curso')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos'] })
      toast.success('Curso deletado!')
    },
    onError: (error) => {
      toast.error('Erro ao deletar curso', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

// ==========================================
// HOOKS - MODULOS
// ==========================================

export function useAdminCriarModulo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ModuloCreateInput) => {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao criar modulo')
      }
      return json.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos', variables.course_id] })
      toast.success('Modulo criado!')
    },
    onError: (error) => {
      toast.error('Erro ao criar modulo', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useAdminAtualizarModulo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ModuloUpdateInput }) => {
      const response = await fetch(`/api/admin/modules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao atualizar modulo')
      }
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos'] })
      toast.success('Modulo atualizado!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar modulo', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useAdminDeletarModulo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao deletar modulo')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos'] })
      toast.success('Modulo deletado!')
    },
    onError: (error) => {
      toast.error('Erro ao deletar modulo', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

// ==========================================
// HOOKS - AULAS
// ==========================================

export function useAdminCriarAula() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AulaCreateInput) => {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao criar aula')
      }
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos'] })
      toast.success('Aula criada!')
    },
    onError: (error) => {
      toast.error('Erro ao criar aula', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useAdminAtualizarAula() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AulaUpdateInput }) => {
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao atualizar aula')
      }
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos'] })
      toast.success('Aula atualizada!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar aula', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useAdminDeletarAula() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao deletar aula')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cursos'] })
      toast.success('Aula deletada!')
    },
    onError: (error) => {
      toast.error('Erro ao deletar aula', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}
