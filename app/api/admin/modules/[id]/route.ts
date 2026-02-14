import { NextRequest, NextResponse } from 'next/server'
import { verificarAdmin } from '@/lib/admin/verificar-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { moduloUpdateSchema } from '@/lib/schemas/admin'

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
    const validated = moduloUpdateSchema.parse(body)

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('course_modules')
      .update(validated)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar modulo: ${error.message}`)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await verificarAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { error } = await admin.from('course_modules').delete().eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar modulo: ${error.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
