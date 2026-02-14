import { NextRequest, NextResponse } from 'next/server'
import { verificarAdmin } from '@/lib/admin/verificar-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { aulaCreateSchema } from '@/lib/schemas/admin'

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await verificarAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validated = aulaCreateSchema.parse(body)

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('lessons')
      .insert(validated)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar aula: ${error.message}`)
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
