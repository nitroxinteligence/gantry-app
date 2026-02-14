'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/providers/auth-provider'

interface AdminAuthData {
  userId: string
  isAdmin: boolean
}

async function verificarAdminAuth(): Promise<AdminAuthData> {
  const response = await fetch('/api/admin/auth')
  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.error ?? 'Nao autorizado')
  }

  return json.data
}

export function useAdminAuth() {
  const { user, isLoading: isAuthLoading } = useAuth()

  const query = useQuery({
    queryKey: ['admin', 'auth', user?.id],
    queryFn: verificarAdminAuth,
    enabled: !!user && !isAuthLoading,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  return {
    isAdmin: query.data?.isAdmin ?? false,
    isLoading: isAuthLoading || query.isLoading,
    isError: query.isError,
    error: query.error,
    user,
  }
}
