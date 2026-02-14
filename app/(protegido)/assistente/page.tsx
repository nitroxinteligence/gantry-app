'use client'

import * as React from 'react'
import {
  Clock,
  FileText,
  Loader2,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Search,
  Send,
  Square,
  Trash2,
  X,
} from 'lucide-react'

import { Botao } from '@/componentes/ui/botao'
import { Cartao, CartaoConteudo } from '@/componentes/ui/cartao'
import { cn } from '@/lib/utilidades'
import { useAuth } from '@/lib/providers/auth-provider'
import {
  useConversas,
  useCreateConversa,
  useDeleteConversa,
  useMensagens,
  useEnviarMensagem,
} from '@/hooks/useAssistente'
import { useGravacaoVoz } from '@/hooks/useGravacaoVoz'
import { cartoesSugestao } from './dados-assistente'
import type { Mensagem } from '@/lib/supabase/types'

export default function PaginaAssistente() {
  const [conversaAtivaId, setConversaAtivaId] = React.useState<string | null>(null)
  const [textoAtual, setTextoAtual] = React.useState('')
  const [buscaSidebar, setBuscaSidebar] = React.useState('')
  const [arquivoSelecionado, setArquivoSelecionado] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const inputArquivoRef = React.useRef<HTMLInputElement>(null)
  const containerMensagensRef = React.useRef<HTMLDivElement>(null)
  const fimMensagensRef = React.useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const nomeUsuario = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const primeiroNome = nomeUsuario.split(' ')[0] ?? nomeUsuario

  // Hooks de dados
  const { data: conversas = [], isLoading: carregandoConversas } = useConversas()
  const { mutateAsync: criarConversa, isPending: criandoConversa } = useCreateConversa()
  const { mutate: deletarConversa } = useDeleteConversa()
  const { data: mensagensDb = [] } = useMensagens(conversaAtivaId ?? undefined)
  const { enviar, cancelar, isStreaming, respostaParcial } = useEnviarMensagem(conversaAtivaId ?? undefined)

  // Voice recording
  const handleTranscricao = React.useCallback((texto: string) => {
    setTextoAtual(prev => prev + texto)
  }, [])
  const gravacao = useGravacaoVoz(handleTranscricao)

  // Auto-selecionar primeira conversa
  React.useEffect(() => {
    if (!conversaAtivaId && conversas.length > 0) {
      setConversaAtivaId(conversas[0]!.id)
    }
  }, [conversas, conversaAtivaId])

  // Filtrar conversas pela busca
  const conversasFiltradas = buscaSidebar
    ? conversas.filter(c =>
        c.titulo.toLowerCase().includes(buscaSidebar.toLowerCase()) ||
        (c.ultima_mensagem ?? '').toLowerCase().includes(buscaSidebar.toLowerCase())
      )
    : conversas

  const rolarParaBaixo = React.useCallback((behavior: ScrollBehavior = 'auto') => {
    const container = containerMensagensRef.current
    if (!container) return
    const scroll = () => {
      container.scrollTo({ top: container.scrollHeight, behavior })
      fimMensagensRef.current?.scrollIntoView({ behavior, block: 'end' })
    }
    scroll()
    window.requestAnimationFrame(scroll)
    window.setTimeout(scroll, 120)
  }, [])

  // Mensagens combinadas (DB + streaming parcial)
  const mensagens: (Mensagem | { id: string; autor: string; conteudo: string; streaming: true })[] = [
    ...mensagensDb,
    ...(isStreaming && respostaParcial
      ? [{ id: 'streaming', autor: 'assistente' as const, conteudo: respostaParcial, streaming: true as const }]
      : []),
  ]

  const mostrarHero = mensagens.length === 0

  React.useLayoutEffect(() => {
    rolarParaBaixo('auto')
  }, [mensagens.length, conversaAtivaId, rolarParaBaixo, respostaParcial])

  const criarNovaConversa = async () => {
    try {
      const nova = await criarConversa('Nova conversa')
      setConversaAtivaId(nova.id)
      setTextoAtual('')
    } catch {
      // erro tratado no hook
    }
  }

  const enviarMensagem = async (conteudo?: string) => {
    const texto = (conteudo ?? textoAtual).trim()
    if (!texto) return

    // Se nao tem conversa ativa, criar uma
    let targetConversaId = conversaAtivaId
    if (!targetConversaId) {
      try {
        const nova = await criarConversa(texto.slice(0, 50))
        targetConversaId = nova.id
        setConversaAtivaId(nova.id)
      } catch {
        return
      }
    }

    setTextoAtual('')
    window.requestAnimationFrame(() => rolarParaBaixo('smooth'))

    const historico = mensagensDb.map(m => ({
      id: m.id,
      autor: m.autor,
      conteudo: m.conteudo,
    }))

    await enviar(texto, historico)
  }

  const tratarEnvio = () => enviarMensagem()

  const tratarTecla = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      tratarEnvio()
    }
  }

  const TIPOS_ACEITOS =
    'image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'

  const selecionarArquivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0]
    if (!arquivo) return
    setArquivoSelecionado(arquivo)
    if (arquivo.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(arquivo))
    } else {
      setPreviewUrl(null)
    }
  }

  const removerArquivo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setArquivoSelecionado(null)
    setPreviewUrl(null)
    if (inputArquivoRef.current) inputArquivoRef.current.value = ''
  }

  const ehImagem = arquivoSelecionado?.type.startsWith('image/') ?? false

  const formatarData = (dateStr: string) => {
    const date = new Date(dateStr)
    const agora = new Date()
    const diffMs = agora.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Agora'
    if (diffMin < 60) return `${diffMin}min`
    const diffHoras = Math.floor(diffMin / 60)
    if (diffHoras < 24) return `${diffHoras}h`
    const diffDias = Math.floor(diffHoras / 24)
    return `${diffDias}d`
  }

  return (
    <>
      <aside className="w-full border-b border-border bg-sidebar p-6 lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:transition-all lg:duration-300">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Builder Assistant</p>
          </div>

          <div className="mt-6">
            <Botao
              className="w-full gap-2"
              onClick={criarNovaConversa}
              disabled={criandoConversa}
            >
              {criandoConversa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Novo chat
            </Botao>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={buscaSidebar}
              onChange={e => setBuscaSidebar(e.target.value)}
              placeholder="Buscar conversa"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="kanban-scroll mt-4 flex-1 space-y-6 overflow-y-auto">
            <div className="relative space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Suas conversas
              </p>
              {carregandoConversas ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {conversasFiltradas.map((conversa) => {
                    const ativa = conversa.id === conversaAtivaId
                    return (
                      <div key={conversa.id} className="group relative">
                        <button
                          type="button"
                          onClick={() => setConversaAtivaId(conversa.id)}
                          className={cn(
                            'flex w-full flex-col gap-2 rounded-xl border border-border px-3 py-3 text-left transition',
                            ativa
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-background/60 text-foreground hover:bg-secondary/60'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold truncate">{conversa.titulo}</p>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              {formatarData(conversa.updated_at)}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {conversa.ultima_mensagem ?? 'Nova conversa'}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            deletarConversa(conversa.id)
                            if (conversaAtivaId === conversa.id) {
                              setConversaAtivaId(null)
                            }
                          }}
                          className="absolute right-2 top-2 hidden rounded-md p-1 text-muted-foreground hover:text-destructive group-hover:block"
                          aria-label="Excluir conversa"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}
                  {conversasFiltradas.length === 0 && !carregandoConversas && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {buscaSidebar ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">
            Powered by Gemini Flash 2.5
          </div>
        </div>
      </aside>

      <main
        className={cn(
          'flex-1 px-6 pt-10 pb-20 lg:transition-[padding] lg:duration-300',
          'lg:pl-72 lg:ml-0'
        )}
      >
        <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-5xl flex-col gap-8">
          <div className="flex min-h-0 flex-1 flex-col gap-8 pb-8">
            {mostrarHero ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
                <div className="space-y-2">
                  <p className="text-3xl font-semibold text-muted-foreground sm:text-4xl">
                    Ola,{' '}
                    <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                      {primeiroNome}
                    </span>
                  </p>
                  <p className="text-2xl font-semibold text-muted-foreground sm:text-3xl">
                    Como posso ajudar hoje?
                  </p>
                </div>
                <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {cartoesSugestao.map((cartao) => (
                    <button
                      key={cartao.id}
                      type="button"
                      onClick={() => enviarMensagem(cartao.acao)}
                      className="text-left"
                    >
                      <Cartao className="h-full transition hover:bg-secondary/50">
                        <CartaoConteudo className="flex h-full flex-col gap-4 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                            <cartao.icone className="h-4 w-4" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold">{cartao.titulo}</p>
                            <p className="text-xs text-muted-foreground">{cartao.descricao}</p>
                          </div>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {cartao.itens.map((item) => (
                              <li key={item}>&#8226; {item}</li>
                            ))}
                          </ul>
                        </CartaoConteudo>
                      </Cartao>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
                <div
                  ref={containerMensagensRef}
                  className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4 pr-2 scroll-pb-24"
                >
                  {mensagens.map((mensagem) => {
                    const ehUsuario = mensagem.autor === 'usuario'
                    const ehStreamingMsg = 'streaming' in mensagem
                    return (
                      <div
                        key={mensagem.id}
                        className={cn('flex', ehUsuario ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[75%] space-y-3 rounded-2xl border border-border px-4 py-3 text-sm',
                            ehUsuario
                              ? 'bg-sidebar text-[#1f1f1f] dark:text-foreground'
                              : 'bg-background/60'
                          )}
                        >
                          <div className="whitespace-pre-wrap">{mensagem.conteudo}</div>
                          {ehStreamingMsg && (
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {isStreaming && !respostaParcial && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-muted-foreground">Pensando...</span>
                      </div>
                    </div>
                  )}
                  <div ref={fimMensagensRef} className="h-1 w-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 left-0 right-0 z-30 px-6 lg:pl-8">
        <div className="mx-auto w-full max-w-3xl lg:pl-64">
          <input
            ref={inputArquivoRef}
            type="file"
            accept={TIPOS_ACEITOS}
            onChange={selecionarArquivo}
            className="hidden"
            aria-label="Selecionar arquivo"
          />

          {arquivoSelecionado ? (
            <div className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
              {ehImagem && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={arquivoSelecionado.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{arquivoSelecionado.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(arquivoSelecionado.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Botao
                variant="ghost"
                size="icon"
                aria-label="Remover arquivo"
                onClick={removerArquivo}
                className="h-8 w-8 shrink-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Botao>
            </div>
          ) : null}

          {gravacao.isGravando && (
            <div className="mb-2 flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/5 px-4 py-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-destructive" />
              <span className="text-sm font-medium text-destructive">
                Gravando {gravacao.formatarDuracao(gravacao.duracao)}
              </span>
              <Botao
                variant="ghost"
                size="sm"
                onClick={gravacao.parar}
                className="ml-auto gap-1 text-destructive"
              >
                <Square className="h-3 w-3" />
                Parar
              </Botao>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full border border-border bg-[#F5F5F5] dark:bg-[#1E1E1E] px-4 py-2">
            <Botao
              variant="ghost"
              size="icon"
              aria-label="Anexar arquivo"
              onClick={() => inputArquivoRef.current?.click()}
              className="rounded-full"
            >
              <Paperclip className="h-4 w-4" />
            </Botao>
            <textarea
              value={textoAtual}
              onChange={(event) => setTextoAtual(event.target.value)}
              onKeyDown={tratarTecla}
              rows={1}
              placeholder="Digite sua mensagem..."
              className="h-11 min-h-[44px] w-full resize-none bg-transparent px-2 py-0 text-sm leading-[44px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
              disabled={isStreaming}
            />
            <Botao
              variant="ghost"
              size="icon"
              aria-label={gravacao.isGravando ? 'Parar gravacao' : 'Mensagem por voz'}
              className="rounded-full"
              onClick={gravacao.isGravando ? gravacao.parar : gravacao.iniciar}
            >
              {gravacao.isGravando ? (
                <MicOff className="h-4 w-4 text-destructive" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Botao>
            {isStreaming ? (
              <Botao
                size="icon"
                variant="destructive"
                aria-label="Cancelar"
                onClick={cancelar}
                className="rounded-full"
              >
                <Square className="h-4 w-4" />
              </Botao>
            ) : (
              <Botao
                size="icon"
                aria-label="Enviar mensagem"
                onClick={tratarEnvio}
                disabled={!textoAtual.trim() && !arquivoSelecionado}
                className="rounded-full"
              >
                <Send className="h-4 w-4" />
              </Botao>
            )}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            O Assistant pode cometer erros. Verifique informacoes criticas.
          </p>
        </div>
      </div>
    </>
  )
}
