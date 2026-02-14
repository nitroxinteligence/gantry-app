import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { buildContextoUsuario } from '@/lib/ai/context-builder'
import { buildMorningBriefingPrompt } from '@/lib/ai/system-prompt'
import { gerarBriefingMatinal } from '@/lib/ai/gemini'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient() as unknown as SupabaseClient
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Nao autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const contexto = await buildContextoUsuario(supabase, user.id)
    const prompt = buildMorningBriefingPrompt(contexto)
    const briefing = await gerarBriefingMatinal(prompt)

    return new Response(JSON.stringify({ briefing }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
