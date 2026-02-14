import { NextResponse } from 'next/server'
import { verificarAdmin } from '@/lib/admin/verificar-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { isAdmin } = await verificarAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const admin = createAdminClient()

    const [
      usersResult,
      tasksResult,
      focusResult,
      habitsResult,
      coursesResult,
      lessonsResult,
    ] = await Promise.all([
      admin.from('users').select('id, total_xp, level, current_streak, created_at'),
      admin.from('tasks').select('id, status, created_at'),
      admin.from('focus_sessions').select('id, status, user_id, created_at'),
      admin.from('habits').select('id, ativo, user_id'),
      admin.from('courses').select('id, status'),
      admin.from('lesson_progress').select('id, concluida'),
    ])

    const users = usersResult.data ?? []
    const tasks = tasksResult.data ?? []
    const focusSessions = focusResult.data ?? []
    const habits = habitsResult.data ?? []
    const courses = coursesResult.data ?? []
    const lessonProgress = lessonsResult.data ?? []

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const focusUserIds7d = new Set(
      focusSessions.filter((s) => s.created_at >= sevenDaysAgo).map((s) => s.user_id)
    )
    const focusUserIds30d = new Set(
      focusSessions.filter((s) => s.created_at >= thirtyDaysAgo).map((s) => s.user_id)
    )

    const analytics = {
      total_usuarios: users.length,
      usuarios_ativos_7d: focusUserIds7d.size,
      usuarios_ativos_30d: focusUserIds30d.size,
      xp_medio: users.length > 0
        ? Math.round(users.reduce((sum, u) => sum + (u.total_xp || 0), 0) / users.length)
        : 0,
      nivel_medio: users.length > 0
        ? Math.round((users.reduce((sum, u) => sum + (u.level || 0), 0) / users.length) * 10) / 10
        : 0,
      total_tarefas_concluidas: tasks.filter((t) => t.status === 'concluido').length,
      total_sessoes_foco: focusSessions.filter((s) => s.status === 'completed').length,
      total_habitos_ativos: habits.filter((h) => h.ativo).length,
      streak_medio: users.length > 0
        ? Math.round((users.reduce((sum, u) => sum + (u.current_streak || 0), 0) / users.length) * 10) / 10
        : 0,
      total_cursos_publicados: courses.filter((c) => c.status === 'publicado').length,
      total_aulas_concluidas: lessonProgress.filter((l) => l.concluida).length,
      novos_usuarios_7d: users.filter((u) => u.created_at >= sevenDaysAgo).length,
      novos_usuarios_30d: users.filter((u) => u.created_at >= thirtyDaysAgo).length,
    }

    return NextResponse.json({ success: true, data: analytics })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
