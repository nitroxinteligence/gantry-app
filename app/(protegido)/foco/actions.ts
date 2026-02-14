import { z } from "zod"

import { supabase } from "@/lib/supabase"
import {
  focusModeMap,
  focusModeReverseMap,
  kanbanColumnNames,
  priorityNames,
  type FocusMode,
  type FocusPause,
  type KanbanColumn,
  type SessionStatus,
  type TaskPriority,
} from "@/lib/supabase/types"

import type {
  ActionResponse,
  CompleteFocusSessionInput,
  CreateFocusSessionInput,
  FocusHistoryFilters,
  FocusHistoryItem,
  FocusStatsDisplay,
  FocusTask,
  PaginatedResponse,
  PaginationOptions,
  SavePartialSessionInput,
  UpdateFocusSessionInput,
} from "./types"

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createSessionSchema = z.object({
  taskId: z.string().uuid().nullable(),
  modo: z.string().min(1),
  duracaoPlanejada: z.number().int().min(60).max(10800),
})

const updateSessionSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
  duracaoReal: z.number().int().min(0).optional(),
  pausas: z.array(z.object({
    started_at: z.string(),
    ended_at: z.string(),
    duration: z.number(),
  })).optional(),
})

const completeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  duracaoReal: z.number().int().min(0),
})

const savePartialSchema = z.object({
  sessionId: z.string().uuid(),
  duracaoReal: z.number().int().min(0),
  pausas: z.array(z.object({
    started_at: z.string(),
    ended_at: z.string(),
    duration: z.number(),
  })),
})

// ============================================================================
// AUTH HELPER
// ============================================================================

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Usuário não autenticado")
  }
  return user.id
}

// ============================================================================
// TASKS
// ============================================================================

export async function getAvailableTasks(): Promise<ActionResponse<FocusTask[]>> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from("tasks")
      .select("id, titulo, coluna, prioridade")
      .eq("user_id", userId)
      .neq("coluna", "concluido")
      .order("ordem", { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    const tasks: FocusTask[] = (data ?? []).map((task: {
      id: string
      titulo: string
      coluna: KanbanColumn
      prioridade: TaskPriority
    }) => ({
      id: task.id,
      titulo: task.titulo,
      coluna: kanbanColumnNames[task.coluna] ?? task.coluna,
      prioridade: priorityNames[task.prioridade] ?? task.prioridade,
    }))

    return { success: true, data: tasks }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar tarefas",
    }
  }
}

export async function markTaskAsCompleted(
  taskId: string
): Promise<ActionResponse> {
  try {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from("tasks")
      .update({
        coluna: "concluido",
        status: "concluido",
      })
      .eq("id", taskId)
      .eq("user_id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao completar tarefa",
    }
  }
}

// ============================================================================
// FOCUS SESSIONS
// ============================================================================

export async function createFocusSession(
  input: CreateFocusSessionInput
): Promise<ActionResponse<{ sessionId: string }>> {
  try {
    const validated = createSessionSchema.safeParse(input)
    if (!validated.success) {
      return { success: false, error: "Dados inválidos para criar sessão" }
    }

    const userId = await getCurrentUserId()

    await supabase.rpc("cancel_active_sessions", { p_user_id: userId })

    const dbMode = focusModeMap[validated.data.modo] ?? "pomodoro"

    const { data, error } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: userId,
        task_id: validated.data.taskId,
        modo: dbMode,
        duracao_planejada: validated.data.duracaoPlanejada,
        duracao_real: 0,
        status: "active",
        pausas: [],
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: { sessionId: data.id } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar sessão",
    }
  }
}

export async function updateFocusSession(
  input: UpdateFocusSessionInput
): Promise<ActionResponse> {
  try {
    const validated = updateSessionSchema.safeParse(input)
    if (!validated.success) {
      return { success: false, error: "Dados inválidos para atualizar sessão" }
    }

    const userId = await getCurrentUserId()

    const updateData: Record<string, unknown> = {}

    if (validated.data.status !== undefined) {
      updateData.status = validated.data.status
    }
    if (validated.data.duracaoReal !== undefined) {
      updateData.duracao_real = validated.data.duracaoReal
    }
    if (validated.data.pausas !== undefined) {
      updateData.pausas = validated.data.pausas
    }

    const { error } = await supabase
      .from("focus_sessions")
      .update(updateData)
      .eq("id", validated.data.sessionId)
      .eq("user_id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar sessão",
    }
  }
}

export async function completeFocusSession(
  input: CompleteFocusSessionInput
): Promise<
  ActionResponse<{
    xpEarned: number
    newTotalXp: number
    newLevel: number
    levelUp: boolean
  }>
> {
  try {
    const validated = completeSessionSchema.safeParse(input)
    if (!validated.success) {
      return { success: false, error: "Dados inválidos para completar sessão" }
    }

    const { data, error } = await supabase.rpc("complete_focus_session", {
      p_session_id: validated.data.sessionId,
      p_duration_real: validated.data.duracaoReal,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const result = data[0] as {
      xp_earned: number
      new_total_xp: number
      new_level: number
      level_up: boolean
    }

    return {
      success: true,
      data: {
        xpEarned: result.xp_earned,
        newTotalXp: result.new_total_xp,
        newLevel: result.new_level,
        levelUp: result.level_up,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao completar sessão",
    }
  }
}

export async function cancelFocusSession(
  sessionId: string
): Promise<ActionResponse> {
  try {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from("focus_sessions")
      .update({
        status: "cancelled",
        ended_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("user_id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao cancelar sessão",
    }
  }
}

export async function savePartialSession(
  input: SavePartialSessionInput
): Promise<ActionResponse> {
  try {
    const validated = savePartialSchema.safeParse(input)
    if (!validated.success) {
      return { success: false, error: "Dados inválidos para salvar sessão parcial" }
    }

    const userId = await getCurrentUserId()

    if (validated.data.duracaoReal > 0) {
      const { error } = await supabase.rpc("complete_focus_session", {
        p_session_id: validated.data.sessionId,
        p_duration_real: validated.data.duracaoReal,
      })

      if (error) {
        return { success: false, error: error.message }
      }
    } else {
      const { error } = await supabase
        .from("focus_sessions")
        .update({
          status: "cancelled",
          ended_at: new Date().toISOString(),
          pausas: validated.data.pausas,
        })
        .eq("id", validated.data.sessionId)
        .eq("user_id", userId)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao salvar sessão parcial",
    }
  }
}

export async function getActiveSession(): Promise<
  ActionResponse<{
    id: string
    taskId: string | null
    modo: string
    duracaoPlanejada: number
    duracaoReal: number
    startedAt: string
    pausas: FocusPause[]
  } | null>
> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: true, data: null }
    }

    const session = data as {
      id: string
      task_id: string | null
      modo: FocusMode
      duracao_planejada: number
      duracao_real: number
      started_at: string
      pausas: FocusPause[]
    }

    return {
      success: true,
      data: {
        id: session.id,
        taskId: session.task_id,
        modo: focusModeReverseMap[session.modo] ?? session.modo,
        duracaoPlanejada: session.duracao_planejada,
        duracaoReal: session.duracao_real,
        startedAt: session.started_at,
        pausas: session.pausas ?? [],
      },
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar sessão ativa",
    }
  }
}

// ============================================================================
// HISTORY & STATS
// ============================================================================

export async function getFocusHistory(
  filters: FocusHistoryFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 10 }
): Promise<ActionResponse<PaginatedResponse<FocusHistoryItem>>> {
  try {
    const userId = await getCurrentUserId()

    let query = supabase
      .from("focus_sessions")
      .select(
        `
        id,
        modo,
        duracao_planejada,
        duracao_real,
        xp_ganho,
        started_at,
        ended_at,
        status,
        tasks (
          titulo,
          prioridade
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("started_at", { ascending: false })

    if (filters.modo) {
      query = query.eq("modo", filters.modo)
    }
    if (filters.dataInicio) {
      query = query.gte("started_at", filters.dataInicio)
    }
    if (filters.dataFim) {
      query = query.lte("started_at", filters.dataFim)
    }

    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    interface SessionRow {
      id: string
      modo: FocusMode
      duracao_planejada: number
      duracao_real: number
      xp_ganho: number
      started_at: string
      ended_at: string | null
      status: SessionStatus
      tasks: { titulo: string; prioridade: TaskPriority } | { titulo: string; prioridade: TaskPriority }[] | null
    }

    const items: FocusHistoryItem[] = ((data ?? []) as unknown as SessionRow[]).map((session) => {
      const taskData = Array.isArray(session.tasks) ? session.tasks[0] : session.tasks
      const modoKey = focusModeReverseMap[session.modo] ?? session.modo

      return {
        id: session.id,
        modo: modoKey,
        modoDisplay: getModeDisplayName(session.modo),
        duracaoPlanejada: session.duracao_planejada,
        duracaoReal: session.duracao_real,
        xpGanho: session.xp_ganho,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        status: session.status,
        taskTitulo: taskData?.titulo ?? null,
        taskPrioridade: taskData?.prioridade
          ? priorityNames[taskData.prioridade] ?? taskData.prioridade
          : null,
      }
    })

    const total = count ?? 0
    const totalPages = Math.ceil(total / pagination.limit)

    return {
      success: true,
      data: {
        data: items,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar histórico",
    }
  }
}

export async function getFocusStats(): Promise<ActionResponse<FocusStatsDisplay>> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase.rpc("get_focus_stats", {
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const stats = data[0] as {
      total_sessions: number
      total_seconds: number
      total_xp: number
      average_session_seconds: number
      sessions_today: number
      seconds_today: number
      sessions_this_week: number
      seconds_this_week: number
    }

    const totalMinutes = Math.floor(stats.total_seconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60

    const todayMinutes = Math.floor(stats.seconds_today / 60)
    const todayHours = Math.floor(todayMinutes / 60)
    const todayRemainingMinutes = todayMinutes % 60

    const weekMinutes = Math.floor(stats.seconds_this_week / 60)
    const weekHours = Math.floor(weekMinutes / 60)
    const weekRemainingMinutes = weekMinutes % 60

    return {
      success: true,
      data: {
        totalSessions: Number(stats.total_sessions),
        totalHours,
        totalMinutes: remainingMinutes,
        totalXp: Number(stats.total_xp),
        averageMinutes: Math.round(Number(stats.average_session_seconds) / 60),
        sessionsToday: Number(stats.sessions_today),
        hoursToday: todayHours,
        minutesToday: todayRemainingMinutes,
        sessionsThisWeek: Number(stats.sessions_this_week),
        hoursThisWeek: weekHours,
        minutesThisWeek: weekRemainingMinutes,
      },
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar estatísticas",
    }
  }
}

// ============================================================================
// USER
// ============================================================================

export async function getCurrentUser(): Promise<
  ActionResponse<{
    id: string
    name: string
    email: string
    totalXp: number
    level: number
  }>
> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, total_xp, level")
      .eq("id", userId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    const user = data as {
      id: string
      name: string
      email: string
      total_xp: number
      level: number
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        totalXp: user.total_xp,
        level: user.level,
      },
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar usuário",
    }
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getModeDisplayName(modo: string): string {
  const names: Record<string, string> = {
    pomodoro: "Pomodoro",
    deep_work: "Deep Work",
    flowtime: "Flowtime",
    custom: "Personalizado",
  }
  return names[modo] ?? modo
}
