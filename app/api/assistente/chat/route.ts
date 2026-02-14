import { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { buildContextoUsuario } from '@/lib/ai/context-builder'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'
import { streamChatComGemini } from '@/lib/ai/gemini'
import { executarFuncao } from '@/lib/ai/action-executor'
import { chatRequestSchema } from '@/lib/schemas/assistente'
import type { MensagemChat } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient() as unknown as SupabaseClient
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Nao autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Dados invalidos', details: parsed.error.format() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { conversaId, mensagem, historico } = parsed.data

    // Salvar mensagem do usuario
    await supabase.from('mensagens').insert({
      conversa_id: conversaId,
      autor: 'usuario',
      conteudo: mensagem,
      metadata: {},
    })

    // Construir contexto
    const contexto = await buildContextoUsuario(supabase, user.id)
    const systemPrompt = buildSystemPrompt(contexto)

    // Converter historico para formato Gemini
    const historicoGemini: MensagemChat[] = historico.map(m => ({
      role: m.autor === 'usuario' ? 'user' as const : 'model' as const,
      parts: [{ text: m.conteudo }],
    }))

    // Stream da resposta
    const encoder = new TextEncoder()
    let respostaCompleta = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChatComGemini(historicoGemini, mensagem, systemPrompt)) {
            // Verificar se e uma chamada de funcao
            if (chunk.startsWith('{"tipo":"funcao"')) {
              try {
                const funcCall = JSON.parse(chunk)
                const resultado = await executarFuncao(
                  supabase,
                  user.id,
                  funcCall.nome,
                  funcCall.args
                )
                const acaoTexto = `\n\n${resultado.sucesso ? '✅' : '❌'} ${resultado.mensagem}`
                respostaCompleta += acaoTexto
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: 'acao', conteudo: acaoTexto, resultado })}\n\n`))
              } catch {
                // Se nao parsear como funcao, tratar como texto
                respostaCompleta += chunk
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: 'texto', conteudo: chunk })}\n\n`))
              }
            } else {
              respostaCompleta += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: 'texto', conteudo: chunk })}\n\n`))
            }
          }

          // Salvar resposta completa
          if (respostaCompleta.trim()) {
            await supabase.from('mensagens').insert({
              conversa_id: conversaId,
              autor: 'assistente',
              conteudo: respostaCompleta.trim(),
              metadata: {},
            })

            await supabase.from('conversas')
              .update({ ultima_mensagem: respostaCompleta.trim().slice(0, 200) })
              .eq('id', conversaId)
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tipo: 'erro', conteudo: errorMsg })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
