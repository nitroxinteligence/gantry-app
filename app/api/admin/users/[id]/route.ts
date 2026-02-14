import { NextRequest, NextResponse } from 'next/server'
import { verificarAdmin } from '@/lib/admin/verificar-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await verificarAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const admin = createAdminClient()

    if (body.action === 'bloquear') {
      const banUntil = body.bloqueado ? '2099-12-31T23:59:59Z' : 'epoch'
      const { error } = await admin.auth.admin.updateUserById(id, {
        ban_duration: body.bloqueado ? '876000h' : 'none',
      })

      if (error) {
        throw new Error(`Erro ao atualizar usuario: ${error.message}`)
      }

      return NextResponse.json({ success: true, data: { bloqueado: body.bloqueado } })
    }

    if (body.action === 'resetar_senha') {
      const { data: userData, error: userError } = await admin.auth.admin.getUserById(id)
      if (userError || !userData.user?.email) {
        throw new Error('Usuario nao encontrado ou sem email')
      }

      const { error } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: userData.user.email,
      })

      if (error) {
        throw new Error(`Erro ao gerar link de recuperacao: ${error.message}`)
      }

      return NextResponse.json({ success: true, data: { email: userData.user.email } })
    }

    return NextResponse.json({ success: false, error: 'Acao invalida' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
