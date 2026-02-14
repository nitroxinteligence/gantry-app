'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UsuarioAdmin } from '@/types/admin'

async function fetchUsuarios(): Promise<UsuarioAdmin[]> {
  const response = await fetch('/api/admin/users')
  const json = await response.json()
  if (!response.ok || !json.success) {
    throw new Error(json.error ?? 'Erro ao buscar usuarios')
  }
  return json.data
}

export function useAdminUsuarios() {
  return useQuery({
    queryKey: ['admin', 'usuarios'],
    queryFn: fetchUsuarios,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAdminBloquearUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, bloqueado }: { userId: string; bloqueado: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bloquear', bloqueado }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao atualizar usuario')
      }
      return json.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] })
      toast.success(variables.bloqueado ? 'Usuario bloqueado!' : 'Usuario desbloqueado!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar usuario', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useAdminResetarSenha() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetar_senha' }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao resetar senha')
      }
      return json.data
    },
    onSuccess: (data) => {
      toast.success('Link de recuperacao gerado!', {
        description: `Email: ${data.email}`,
      })
    },
    onError: (error) => {
      toast.error('Erro ao resetar senha', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}
