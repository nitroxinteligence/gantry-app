import { NextRequest, NextResponse } from 'next/server'
import { verificarAdmin } from '@/lib/admin/verificar-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { cursoUpdateSchema } from '@/lib/schemas/admin'

export async function GET(
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

    const { data: course, error: courseError } = await admin
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (courseError) {
      throw new Error(`Curso nao encontrado: ${courseError.message}`)
    }

    const { data: modules, error: modulesError } = await admin
      .from('course_modules')
      .select('*')
      .eq('course_id', id)
      .order('ordem')

    if (modulesError) {
      throw new Error(`Erro ao buscar modulos: ${modulesError.message}`)
    }

    const moduleIds = (modules ?? []).map((m) => m.id)

    let lessons: Record<string, unknown>[] = []
    if (moduleIds.length > 0) {
      const { data: lessonsData, error: lessonsError } = await admin
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('ordem')

      if (lessonsError) {
        throw new Error(`Erro ao buscar aulas: ${lessonsError.message}`)
      }
      lessons = lessonsData ?? []
    }

    const modulosComAulas = (modules ?? []).map((modulo) => ({
      ...modulo,
      aulas: lessons.filter((l) => l.module_id === modulo.id),
    }))

    return NextResponse.json({
      success: true,
      data: { ...course, modulos: modulosComAulas },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

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
    const validated = cursoUpdateSchema.parse(body)

    const updateData: Record<string, unknown> = { ...validated }
    if (validated.titulo) {
      updateData.slug = validated.titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar curso: ${error.message}`)
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

    const { error } = await admin.from('courses').delete().eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar curso: ${error.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
