'use client'

import { useAdminAnalytics } from '@/hooks/admin/useAdminAnalytics'
import {
  Users,
  Zap,
  Target,
  Clock,
  TrendingUp,
  GraduationCap,
  Flame,
  Activity,
  UserPlus,
  CheckCircle,
  BookOpen,
  BarChart3,
} from 'lucide-react'

interface CartaoMetricaProps {
  titulo: string
  valor: string | number
  icon: React.ReactNode
  descricao?: string
  cor?: string
}

function CartaoMetrica({ titulo, valor, icon, descricao, cor = 'violet' }: CartaoMetricaProps) {
  const corClasses: Record<string, string> = {
    violet: 'bg-violet-500/10 text-violet-400',
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    orange: 'bg-orange-500/10 text-orange-400',
    pink: 'bg-pink-500/10 text-pink-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{titulo}</p>
          <p className="text-2xl font-bold text-white mt-1">{valor}</p>
          {descricao && <p className="text-xs text-zinc-500 mt-1">{descricao}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${corClasses[cor] ?? corClasses.violet}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: analytics, isLoading, isError } = useAdminAnalytics()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-zinc-800 rounded w-24 mb-3" />
              <div className="h-7 bg-zinc-800 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError || !analytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
          Erro ao carregar analytics. Tente novamente.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Visao geral da plataforma</p>
      </div>

      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Usuarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CartaoMetrica
            titulo="Total Usuarios"
            valor={analytics.total_usuarios}
            icon={<Users className="w-5 h-5" />}
            cor="violet"
          />
          <CartaoMetrica
            titulo="Ativos (7 dias)"
            valor={analytics.usuarios_ativos_7d}
            icon={<Activity className="w-5 h-5" />}
            cor="green"
          />
          <CartaoMetrica
            titulo="Ativos (30 dias)"
            valor={analytics.usuarios_ativos_30d}
            icon={<TrendingUp className="w-5 h-5" />}
            cor="blue"
          />
          <CartaoMetrica
            titulo="Novos (7 dias)"
            valor={analytics.novos_usuarios_7d}
            icon={<UserPlus className="w-5 h-5" />}
            descricao={`${analytics.novos_usuarios_30d} nos ultimos 30 dias`}
            cor="cyan"
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CartaoMetrica
            titulo="XP Medio"
            valor={analytics.xp_medio.toLocaleString('pt-BR')}
            icon={<Zap className="w-5 h-5" />}
            cor="orange"
          />
          <CartaoMetrica
            titulo="Nivel Medio"
            valor={analytics.nivel_medio.toFixed(1)}
            icon={<BarChart3 className="w-5 h-5" />}
            cor="violet"
          />
          <CartaoMetrica
            titulo="Streak Medio"
            valor={`${analytics.streak_medio.toFixed(1)} dias`}
            icon={<Flame className="w-5 h-5" />}
            cor="orange"
          />
          <CartaoMetrica
            titulo="Habitos Ativos"
            valor={analytics.total_habitos_ativos}
            icon={<Target className="w-5 h-5" />}
            cor="green"
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Producao</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CartaoMetrica
            titulo="Tarefas Concluidas"
            valor={analytics.total_tarefas_concluidas}
            icon={<CheckCircle className="w-5 h-5" />}
            cor="green"
          />
          <CartaoMetrica
            titulo="Sessoes de Foco"
            valor={analytics.total_sessoes_foco}
            icon={<Clock className="w-5 h-5" />}
            cor="blue"
          />
          <CartaoMetrica
            titulo="Cursos Publicados"
            valor={analytics.total_cursos_publicados}
            icon={<GraduationCap className="w-5 h-5" />}
            cor="pink"
          />
          <CartaoMetrica
            titulo="Aulas Concluidas"
            valor={analytics.total_aulas_concluidas}
            icon={<BookOpen className="w-5 h-5" />}
            cor="cyan"
          />
        </div>
      </div>
    </div>
  )
}
