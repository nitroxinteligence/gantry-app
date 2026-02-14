import { NextResponse } from 'next/server'
import { verificarAdmin } from '@/lib/admin/verificar-admin'

export async function GET() {
  try {
    const { authenticated, isAdmin, userId } = await verificarAdmin()

    if (!authenticated) {
      return NextResponse.json({ success: false, error: 'Nao autenticado' }, { status: 401 })
    }

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: { userId, isAdmin: true } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
