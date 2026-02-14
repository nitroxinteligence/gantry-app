import { NextRequest, NextResponse } from 'next/server'
import { verificarAdmin } from '@/lib/admin/verificar-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { cursoCreateSchema } from '@/lib/schemas/admin'

export async function GET() {
  try {
    const { isAdmin } = await verificarAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const admin = createAdminClient()

    const [coursesResult, modulesResult, lessonsResult] = await Promise.all([
      admin.from('courses').select('*').order('ordem'),
      admin.from('course_modules').select('id, course_id'),
      admin.from('lessons').select('id, module_id'),
    ])

    if (coursesResult.error) {
      throw new Error(`Erro ao buscar cursos: ${coursesResult.error.message}`)
    }

    const modules = modulesResult.data ?? []
    const lessons = lessonsResult.data ?? []

    const modulesByCourse = new Map<string, string[]>()
    for (const m of modules) {
      const list = modulesByCourse.get(m.course_id) ?? []
      list.push(m.id)
      modulesByCourse.set(m.course_id, list)
    }

    const lessonsByModule = new Map<string, number>()
    for (const l of lessons) {
      lessonsByModule.set(l.module_id, (lessonsByModule.get(l.module_id) ?? 0) + 1)
    }

    const courses = (coursesResult.data ?? []).map((course) => {
      const courseModuleIds = modulesByCourse.get(course.id) ?? []
      const totalAulas = courseModuleIds.reduce(
        (sum, moduleId) => sum + (lessonsByModule.get(moduleId) ?? 0),
        0
      )
      return {
        ...course,
        total_modulos: courseModuleIds.length,
        total_aulas: totalAulas,
      }
    })

    return NextResponse.json({ success: true, data: courses })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await verificarAdmin()
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validated = cursoCreateSchema.parse(body)

    const slug = validated.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('courses')
      .insert({ ...validated, slug })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar curso: ${error.message}`)
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ success: false, error: 'Dados invalidos' }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
