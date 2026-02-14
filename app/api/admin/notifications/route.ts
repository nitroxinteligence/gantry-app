import { NextRequest, NextResponse } from 'next/server'
import { verificarAdmin } from '@/lib/admin/verificar-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { notificacaoMassaSchema } from '@/lib/schemas/admin'

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await verificarAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validated = notificacaoMassaSchema.parse(body)

    const admin = createAdminClient()

    const { data: users, error: usersError } = await admin
      .from('users')
      .select('id')

    if (usersError) {
      throw new Error(`Erro ao buscar usuarios: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: true, data: { enviadas: 0 } })
    }

    const notifications = users.map((user) => ({
      user_id: user.id,
      titulo: validated.titulo,
      mensagem: validated.mensagem,
      tipo: validated.tipo,
      lida: false,
    }))

    const BATCH_SIZE = 500
    let totalEnviadas = 0

    for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
      const batch = notifications.slice(i, i + BATCH_SIZE)
      const { error } = await admin.from('notifications').insert(batch)

      if (error) {
        throw new Error(`Erro ao enviar notificacoes (batch ${i}): ${error.message}`)
      }

      totalEnviadas += batch.length
    }

    return NextResponse.json({
      success: true,
      data: { enviadas: totalEnviadas },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
