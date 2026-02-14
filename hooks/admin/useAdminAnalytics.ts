'use client'

import { useQuery } from '@tanstack/react-query'
import type { AdminAnalytics } from '@/types/admin'

async function fetchAnalytics(): Promise<AdminAnalytics> {
  const response = await fetch('/api/admin/analytics')
  const json = await response.json()

  if (!response.ok || !json.success) {
    throw new Error(json.error ?? 'Erro ao buscar analytics')
  }

  return json.data
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: fetchAnalytics,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  })
}
