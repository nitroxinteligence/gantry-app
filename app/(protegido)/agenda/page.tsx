'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/lib/providers/auth-provider'
import { Botao } from '@/componentes/ui/botao'
import { AnimacaoPagina, SecaoAnimada } from '@/componentes/ui/animacoes'
import {
  DialogoAlerta,
  DialogoAlertaAcao,
  DialogoAlertaCabecalho,
  DialogoAlertaCancelar,
  DialogoAlertaConteudo,
  DialogoAlertaDescricao,
  DialogoAlertaRodape,
  DialogoAlertaTitulo,
} from '@/componentes/ui/dialogo-alerta'
import { useAgenda } from '@/hooks/useAgenda'
import { useIntegracaoCalendario } from '@/hooks/useIntegracaoCalendario'
import type { AgendaEvent, CreateEventDto } from '@/types/agenda'
import type { CalendarProvider } from '@/types/calendario'

import { CalendarioView } from '@/componentes/agenda/calendario-view'
import { ListaEventosDia } from '@/componentes/agenda/lista-eventos-dia'
import {
  FormularioEventoDialogo,
  criarFormularioVazio,
  type FormularioEvento,
} from '@/componentes/agenda/formulario-evento'

export default function PaginaAgenda() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dataSelecionada, setDataSelecionada] = React.useState<Date>(new Date())
  const [novoEventoAberto, setNovoEventoAberto] = React.useState(false)
  const [eventoEditando, setEventoEditando] = React.useState<AgendaEvent | null>(null)
  const [eventoExcluir, setEventoExcluir] = React.useState<AgendaEvent | null>(null)
  const [formEvento, setFormEvento] = React.useState<FormularioEvento>(() =>
    criarFormularioVazio(format(new Date(), 'yyyy-MM-dd'))
  )
  const [salvando, setSalvando] = React.useState(false)
  const [conectandoProvider, setConectandoProvider] = React.useState<string | null>(null)
  const [providerDesconectar, setProviderDesconectar] = React.useState<CalendarProvider | null>(null)
  const syncDoneRef = React.useRef(false)

  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { events, isLoading, error, createEvent, updateEvent, deleteEvent } =
    useAgenda()

  const integracao = useIntegracaoCalendario()

  const dataSelecionadaISO = format(dataSelecionada, 'yyyy-MM-dd')
  const eventosDoDia = events.filter((evento) => evento.data === dataSelecionadaISO)
  const proximosEventos = events
    .filter((evento) => evento.data >= dataSelecionadaISO)
    .slice(0, 5)

  // Detect OAuth callback query params
  React.useEffect(() => {
    const connected = searchParams.get('connected')
    const errorParam = searchParams.get('error')

    if (connected) {
      const providerName = connected === 'google' ? 'Google Calendar' : 'Outlook Calendar'
      toast.success(`${providerName} conectado com sucesso!`)
      router.replace('/agenda')
    }

    if (errorParam) {
      const providerName = errorParam.includes('google') ? 'Google' : 'Outlook'
      const isDenied = errorParam.includes('denied')
      const message = isDenied
        ? `Conexao com ${providerName} foi cancelada.`
        : `Erro ao conectar ${providerName}. Tente novamente.`
      toast.error(message)
      router.replace('/agenda')
    }
  }, [searchParams, router])

  // Auto-sync on page load (non-blocking)
  React.useEffect(() => {
    if (!user || syncDoneRef.current) return
    syncDoneRef.current = true

    const doSync = async () => {
      try {
        const response = await fetch('/api/calendario/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force: false }),
        })
        const data = await response.json()
        if (response.ok && data.success && data.data.totalCreated + data.data.totalUpdated + data.data.totalDeleted > 0) {
          queryClient.invalidateQueries({ queryKey: ['agenda', 'events', user.id] })
          queryClient.invalidateQueries({ queryKey: ['calendario', 'connections', user.id] })
        }
      } catch {
        // Silent — auto-sync should not disrupt the UI
      }
    }

    doSync()
  }, [user, queryClient])

  React.useEffect(() => {
    if (novoEventoAberto) {
      setFormEvento(criarFormularioVazio(dataSelecionadaISO))
    }
  }, [novoEventoAberto, dataSelecionadaISO])

  React.useEffect(() => {
    if (!eventoEditando) {
      return
    }
    setFormEvento({
      titulo: eventoEditando.titulo,
      descricao: eventoEditando.descricao ?? '',
      data: eventoEditando.data,
      horarioInicio: eventoEditando.horario_inicio,
      horarioFim: eventoEditando.horario_fim,
      categoria: eventoEditando.categoria,
      local: eventoEditando.local ?? '',
      status: eventoEditando.status,
      calendario: eventoEditando.calendario,
    })
  }, [eventoEditando])

  const handleConnectCalendar = async (provider: CalendarProvider) => {
    setConectandoProvider(provider)
    try {
      const response = await fetch('/api/calendario/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? 'Failed to initiate connection')
      }

      window.location.href = data.data.url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(`Erro ao conectar: ${message}`)
      setConectandoProvider(null)
    }
  }

  const confirmarDesconexao = async () => {
    if (!providerDesconectar) return

    try {
      await integracao.disconnect(providerDesconectar)
      setProviderDesconectar(null)
    } catch {
      // Error handling done in hook
    }
  }

  const atualizarFormulario = (parcial: Partial<FormularioEvento>) => {
    setFormEvento((prev) => ({ ...prev, ...parcial }))
  }

  const salvarEvento = async () => {
    if (!formEvento.titulo.trim()) {
      return
    }

    setSalvando(true)

    try {
      if (eventoEditando) {
        await updateEvent(eventoEditando.id, {
          titulo: formEvento.titulo,
          descricao: formEvento.descricao || undefined,
          data: formEvento.data,
          horario_inicio: formEvento.horarioInicio,
          horario_fim: formEvento.horarioFim,
          categoria: formEvento.categoria,
          local: formEvento.local || undefined,
          status: formEvento.status,
          calendario: formEvento.calendario,
        })
        setEventoEditando(null)
      } else {
        const novoEvento: CreateEventDto = {
          titulo: formEvento.titulo,
          descricao: formEvento.descricao || undefined,
          data: formEvento.data,
          horario_inicio: formEvento.horarioInicio,
          horario_fim: formEvento.horarioFim,
          categoria: formEvento.categoria,
          local: formEvento.local || undefined,
          status: formEvento.status,
          calendario: formEvento.calendario,
        }
        await createEvent(novoEvento)
        setNovoEventoAberto(false)
      }
    } catch {
      // Error handling is done via React Query
    } finally {
      setSalvando(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!eventoExcluir) {
      return
    }

    setSalvando(true)

    try {
      await deleteEvent(eventoExcluir.id)
      setEventoExcluir(null)
    } catch {
      // Error handling is done via React Query
    } finally {
      setSalvando(false)
    }
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="text-center">
          <p className="text-destructive">Erro ao carregar agenda</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <AnimacaoPagina className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
          <SecaoAnimada className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-titulo text-2xl font-semibold">Agenda</h1>
                <p className="text-sm text-muted-foreground">
                  Organize compromissos, tarefas e blocos de foco.
                </p>
              </div>
            </div>
            <Botao className="gap-2" onClick={() => setNovoEventoAberto(true)}>
              <Plus className="h-4 w-4" />
              Novo evento
            </Botao>
          </SecaoAnimada>

          <SecaoAnimada className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px]" style={{ gridAutoFlow: "dense" }}>
            <ListaEventosDia
              dataSelecionada={dataSelecionada}
              eventosDoDia={eventosDoDia}
              proximosEventos={proximosEventos}
              isLoading={isLoading}
              onEditar={setEventoEditando}
              onExcluir={setEventoExcluir}
            />
            <CalendarioView
              dataSelecionada={dataSelecionada}
              onSelecionarData={setDataSelecionada}
              onConnectGoogle={() => handleConnectCalendar('Google')}
              onConnectOutlook={() => handleConnectCalendar('Outlook')}
              conectandoProvider={conectandoProvider}
              integracao={integracao}
              onRequestDisconnect={setProviderDesconectar}
            />
          </SecaoAnimada>
        </AnimacaoPagina>
      </main>

      <FormularioEventoDialogo
        aberto={novoEventoAberto}
        onOpenChange={setNovoEventoAberto}
        formulario={formEvento}
        onAtualizar={atualizarFormulario}
        onSalvar={salvarEvento}
        salvando={salvando}
        modo="criar"
      />

      <FormularioEventoDialogo
        aberto={Boolean(eventoEditando)}
        onOpenChange={() => setEventoEditando(null)}
        formulario={formEvento}
        onAtualizar={atualizarFormulario}
        onSalvar={salvarEvento}
        salvando={salvando}
        modo="editar"
      />

      <DialogoAlerta
        open={Boolean(eventoExcluir)}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setEventoExcluir(null)
          }
        }}
      >
        <DialogoAlertaConteudo className="rounded-2xl border-border p-6">
          <DialogoAlertaCabecalho>
            <DialogoAlertaTitulo>Excluir evento</DialogoAlertaTitulo>
            <DialogoAlertaDescricao>
              Esse compromisso sera removido do calendario.
            </DialogoAlertaDescricao>
          </DialogoAlertaCabecalho>
          <DialogoAlertaRodape>
            <DialogoAlertaCancelar disabled={salvando}>
              Cancelar
            </DialogoAlertaCancelar>
            <DialogoAlertaAcao onClick={confirmarExclusao} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </DialogoAlertaAcao>
          </DialogoAlertaRodape>
        </DialogoAlertaConteudo>
      </DialogoAlerta>

      <DialogoAlerta
        open={Boolean(providerDesconectar)}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setProviderDesconectar(null)
          }
        }}
      >
        <DialogoAlertaConteudo className="rounded-2xl border-border p-6">
          <DialogoAlertaCabecalho>
            <DialogoAlertaTitulo>
              Desconectar {providerDesconectar} Calendar?
            </DialogoAlertaTitulo>
            <DialogoAlertaDescricao>
              Seus eventos importados do {providerDesconectar} serao removidos.
              Voce pode reconectar a qualquer momento.
            </DialogoAlertaDescricao>
          </DialogoAlertaCabecalho>
          <DialogoAlertaRodape>
            <DialogoAlertaCancelar disabled={integracao.isDisconnecting}>
              Cancelar
            </DialogoAlertaCancelar>
            <DialogoAlertaAcao
              onClick={confirmarDesconexao}
              disabled={integracao.isDisconnecting}
            >
              {integracao.isDisconnecting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Desconectar
            </DialogoAlertaAcao>
          </DialogoAlertaRodape>
        </DialogoAlertaConteudo>
      </DialogoAlerta>
    </>
  )
}
