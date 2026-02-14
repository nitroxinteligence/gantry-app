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

    const { data: users, error } = await admin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar usuarios: ${error.message}`)
    }

    const { data: { users: authUsers } } = await admin.auth.admin.listUsers()
    const bannedUserIds = new Set(
      (authUsers ?? [])
        .filter((u) => u.banned_until && new Date(u.banned_until) > new Date())
        .map((u) => u.id)
    )

    const usersComStatus = (users ?? []).map((user) => ({
      ...user,
      bloqueado: bannedUserIds.has(user.id),
    }))

    return NextResponse.json({ success: true, data: usersComStatus })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
