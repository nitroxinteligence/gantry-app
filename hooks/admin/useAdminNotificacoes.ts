'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { NotificacaoMassa } from '@/types/admin'

export function useAdminEnviarNotificacao() {
  return useMutation({
    mutationFn: async (data: NotificacaoMassa) => {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? 'Erro ao enviar notificacoes')
      }
      return json.data as { enviadas: number }
    },
    onSuccess: (data) => {
      toast.success(`Notificacao enviada para ${data.enviadas} usuarios!`)
    },
    onError: (error) => {
      toast.error('Erro ao enviar notificacoes', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}
