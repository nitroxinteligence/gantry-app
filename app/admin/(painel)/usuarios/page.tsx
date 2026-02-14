'use client'

import { useState } from 'react'
import {
  useAdminUsuarios,
  useAdminBloquearUsuario,
  useAdminResetarSenha,
} from '@/hooks/admin/useAdminUsuarios'
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  KeyRound,
  Zap,
  TrendingUp,
  Flame,
} from 'lucide-react'
import type { UsuarioAdmin } from '@/types/admin'

function LinhaUsuario({ usuario }: { usuario: UsuarioAdmin }) {
  const bloquear = useAdminBloquearUsuario()
  const resetarSenha = useAdminResetarSenha()

  function handleToggleBlock() {
    const action = usuario.bloqueado ? 'desbloquear' : 'bloquear'
    if (!confirm(`Tem certeza que deseja ${action} "${usuario.name || usuario.email}"?`)) return
    bloquear.mutate({ userId: usuario.id, bloqueado: !usuario.bloqueado })
  }

  function handleResetPassword() {
    if (!confirm(`Enviar email de recuperacao de senha para "${usuario.email}"?`)) return
    resetarSenha.mutate(usuario.id)
  }

  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-medium">
            {(usuario.name || usuario.email)?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-sm text-white font-medium">
              {usuario.name || 'Sem nome'}
            </p>
            <p className="text-xs text-zinc-500">{usuario.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs">
          <Zap className="w-3 h-3 text-orange-400" />
          <span className="text-zinc-300">{usuario.total_xp.toLocaleString('pt-BR')}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingUp className="w-3 h-3 text-violet-400" />
          <span className="text-zinc-300">Lv. {usuario.level}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs">
          <Flame className="w-3 h-3 text-orange-400" />
          <span className="text-zinc-300">{usuario.current_streak} dias</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${
            usuario.bloqueado
              ? 'bg-red-500/10 text-red-400'
              : 'bg-green-500/10 text-green-400'
          }`}
        >
          {usuario.bloqueado ? 'Bloqueado' : 'Ativo'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-zinc-500">
          {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleBlock}
            disabled={bloquear.isPending}
            className={`p-1.5 rounded text-xs transition-colors ${
              usuario.bloqueado
                ? 'text-green-400 hover:bg-green-500/10'
                : 'text-red-400 hover:bg-red-500/10'
            }`}
            title={usuario.bloqueado ? 'Desbloquear' : 'Bloquear'}
          >
            {usuario.bloqueado ? (
              <Shield className="w-4 h-4" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleResetPassword}
            disabled={resetarSenha.isPending}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Resetar Senha"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function AdminUsuariosPage() {
  const { data: usuarios, isLoading } = useAdminUsuarios()
  const [busca, setBusca] = useState('')

  const filtrados = (usuarios ?? []).filter((u) => {
    const query = busca.toLowerCase()
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Usuarios</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Gerenciar usuarios da plataforma
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {isLoading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">
            {busca ? 'Nenhum usuario encontrado' : 'Nenhum usuario cadastrado'}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    XP
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Streak
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((usuario) => (
                  <LinhaUsuario key={usuario.id} usuario={usuario} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-zinc-800 text-xs text-zinc-500">
            {filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}
            {busca && ` encontrado${filtrados.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      )}
    </div>
  )
}
