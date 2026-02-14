'use client'

import { useState } from 'react'
import { useAdminEnviarNotificacao } from '@/hooks/admin/useAdminNotificacoes'
import { Bell, Send } from 'lucide-react'
import type { NotificacaoMassa } from '@/types/admin'

const TIPOS_NOTIFICACAO = [
  { value: 'sistema', label: 'Sistema' },
  { value: 'conquista', label: 'Conquista' },
  { value: 'lembrete', label: 'Lembrete' },
  { value: 'tarefa', label: 'Tarefa' },
  { value: 'habito', label: 'Habito' },
  { value: 'foco', label: 'Foco' },
  { value: 'curso', label: 'Curso' },
] as const

export default function AdminNotificacoesPage() {
  const enviarNotificacao = useAdminEnviarNotificacao()
  const [form, setForm] = useState<NotificacaoMassa>({
    titulo: '',
    mensagem: '',
    tipo: 'sistema',
  })
  const [ultimoEnvio, setUltimoEnvio] = useState<{ enviadas: number; data: Date } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!confirm('Enviar esta notificacao para TODOS os usuarios da plataforma?')) {
      return
    }

    enviarNotificacao.mutate(form, {
      onSuccess: (data) => {
        setUltimoEnvio({ enviadas: data.enviadas, data: new Date() })
        setForm({ titulo: '', mensagem: '', tipo: 'sistema' })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notificacoes</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Enviar notificacoes em massa para todos os usuarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-violet-400" />
            Nova Notificacao
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) =>
                  setForm({ ...form, tipo: e.target.value as NotificacaoMassa['tipo'] })
                }
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {TIPOS_NOTIFICACAO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Titulo</label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required
                placeholder="Ex: Nova funcionalidade disponivel!"
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Mensagem</label>
              <textarea
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                required
                rows={4}
                placeholder="Escreva a mensagem que sera enviada para todos os usuarios..."
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={enviarNotificacao.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {enviarNotificacao.isPending ? 'Enviando...' : 'Enviar para Todos'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-violet-400" />
              Preview
            </h2>

            {form.titulo || form.mensagem ? (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center mt-0.5">
                    <Bell className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {form.titulo || 'Titulo da notificacao'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {form.mensagem || 'Mensagem da notificacao'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                        {TIPOS_NOTIFICACAO.find((t) => t.value === form.tipo)?.label ?? form.tipo}
                      </span>
                      <span className="text-xs text-zinc-600">Agora</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-4">
                Preencha o formulario para ver o preview
              </p>
            )}
          </div>

          {ultimoEnvio && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-green-400 text-sm font-medium">Ultimo envio bem-sucedido</p>
              <p className="text-green-400/70 text-xs mt-1">
                {ultimoEnvio.enviadas} notificacao{ultimoEnvio.enviadas !== 1 ? 'es' : ''}{' '}
                enviada{ultimoEnvio.enviadas !== 1 ? 's' : ''} em{' '}
                {ultimoEnvio.data.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
