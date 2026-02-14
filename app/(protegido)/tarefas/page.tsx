"use client"

import * as React from "react"
import { useCallback } from "react"
import { Plus } from "lucide-react"
import type { DropResult } from "@hello-pangea/dnd"

import { Botao } from "@/componentes/ui/botao"
import { EsqueletoKanban } from "@/componentes/ui/esqueleto"
import { EstadoVazioTarefas } from "@/componentes/ui/estado-vazio"
import { AnimacaoPagina } from "@/componentes/ui/animacoes"
import { ErrorBoundary } from "@/componentes/erro"
import { useAuth } from "@/lib/providers/auth-provider"

import {
  useTarefas,
  useCreateTarefa,
  useUpdateTarefa,
  useDeleteTarefa,
  useMoverTarefa,
} from "@/hooks/useTarefas"
import {
  usePendencias,
  useCreatePendencia,
  useDeletePendencia,
} from "@/hooks/usePendencias"
import { useConfirmarComDados } from "@/hooks/useConfirmar"
import type { Tarefa, Pendencia, Estagio } from "@/lib/supabase/types"
import { XP_RECOMPENSA_TAREFA_NOVA, XP_RECOMPENSA_PENDENCIA_APROVADA } from "@/lib/constants"

import { KanbanBoard } from "@/componentes/tarefas/kanban-board"
import { FiltrosTarefas } from "@/componentes/tarefas/filtros-tarefas"
import {
  estagiosKanban,
  formularioVazio,
  formatarData,
  type FormularioTarefa,
} from "@/componentes/tarefas/tipos"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const obterPrazo = (formulario: FormularioTarefa) => {
  if (formulario.dataVencimento) {
    return formatarData(formulario.dataVencimento)
  }
  return formulario.prazo || "Sem prazo"
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PaginaTarefas() {
  const { user } = useAuth()
  const { data: tarefas = [], isLoading: carregandoTarefas } = useTarefas()
  const { data: pendencias = [], isLoading: carregandoPendencias } =
    usePendencias()

  const createTarefa = useCreateTarefa()
  const updateTarefa = useUpdateTarefa()
  const deleteTarefa = useDeleteTarefa()
  const moverTarefa = useMoverTarefa()
  const createPendencia = useCreatePendencia()
  const deletePendencia = useDeletePendencia()

  // Local state
  const [pendenciasAberto, setPendenciasAberto] = React.useState(false)
  const [novaTarefaAberta, setNovaTarefaAberta] = React.useState(false)
  const [formNova, setFormNova] =
    React.useState<FormularioTarefa>(formularioVazio)
  const [tarefaEditando, setTarefaEditando] = React.useState<Tarefa | null>(
    null
  )
  const [formEdicao, setFormEdicao] =
    React.useState<FormularioTarefa>(formularioVazio)
  const {
    aberto: confirmarExclusaoAberto,
    dados: tarefaParaExcluir,
    confirmarCom,
    onConfirmar: onConfirmarExclusao,
    onCancelar: onCancelarExclusao,
  } = useConfirmarComDados<Tarefa>()
  const [mostrarCampoPendencia, setMostrarCampoPendencia] =
    React.useState(false)
  const [novaPendenciaTexto, setNovaPendenciaTexto] = React.useState("")
  const [buscaTarefa, setBuscaTarefa] = React.useState("")

  // Grouped tasks by stage
  const tarefasPorEstagio = React.useMemo(() => {
    const filtradas = buscaTarefa
      ? tarefas.filter((t) =>
          t.titulo.toLowerCase().includes(buscaTarefa.toLowerCase())
        )
      : tarefas

    return estagiosKanban.map((estagio) => ({
      ...estagio,
      tarefas: filtradas
        .filter((t) => t.coluna === estagio.id)
        .sort((a, b) => a.ordem - b.ordem),
    }))
  }, [tarefas, buscaTarefa])

  // Form updaters (immutable)
  const atualizarFormNova = (parcial: Partial<FormularioTarefa>) =>
    setFormNova((prev) => ({ ...prev, ...parcial }))
  const atualizarFormEdicao = (parcial: Partial<FormularioTarefa>) =>
    setFormEdicao((prev) => ({ ...prev, ...parcial }))

  // Reset forms on dialog open/close
  React.useEffect(() => {
    if (novaTarefaAberta) {
      setFormNova(formularioVazio)
    }
  }, [novaTarefaAberta])

  React.useEffect(() => {
    if (!pendenciasAberto) {
      setMostrarCampoPendencia(false)
      setNovaPendenciaTexto("")
    }
  }, [pendenciasAberto])

  // Drag-and-drop handler
  const aoFinalizarArraste = useCallback(
    async (resultado: DropResult) => {
      const { source, destination, draggableId } = resultado
      if (!destination) return
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return

      const novoEstagio = destination.droppableId as Estagio
      const tarefasDestino = tarefasPorEstagio.find(
        (e) => e.id === novoEstagio
      )?.tarefas

      if (!tarefasDestino) return

      let novaOrdem: number
      if (tarefasDestino.length === 0) {
        novaOrdem = 0
      } else if (destination.index === 0) {
        novaOrdem = (tarefasDestino[0]?.ordem ?? 0) - 1
      } else if (destination.index >= tarefasDestino.length) {
        novaOrdem =
          (tarefasDestino[tarefasDestino.length - 1]?.ordem ?? 0) + 1
      } else {
        const anterior = tarefasDestino[destination.index - 1]?.ordem ?? 0
        const posterior = tarefasDestino[destination.index]?.ordem ?? 0
        novaOrdem = (anterior + posterior) / 2
      }

      moverTarefa.mutate({ id: draggableId, novoEstagio, novaOrdem })
    },
    [tarefasPorEstagio, moverTarefa]
  )

  // Task actions
  const abrirEdicaoTarefa = useCallback((tarefa: Tarefa) => {
    setTarefaEditando(tarefa)
    setFormEdicao({
      titulo: tarefa.titulo,
      prioridade: tarefa.prioridade,
      prazo: tarefa.data_limite || "",
      dataVencimento: undefined,
      categoria: "",
      coluna: tarefa.coluna,
      descricao: tarefa.descricao || "",
    })
  }, [])

  const salvarEdicao = () => {
    if (!tarefaEditando) return
    const prazoFinal = obterPrazo(formEdicao)

    updateTarefa.mutate(
      {
        id: tarefaEditando.id,
        data: {
          titulo: formEdicao.titulo,
          prioridade: formEdicao.prioridade,
          data_limite: prazoFinal !== "Sem prazo" ? prazoFinal : null,
          coluna: formEdicao.coluna,
          descricao: formEdicao.descricao || null,
          status: formEdicao.coluna === "concluido" ? "concluido" : undefined,
          concluida_em:
            formEdicao.coluna === "concluido"
              ? new Date().toISOString()
              : null,
        },
      },
      { onSuccess: () => setTarefaEditando(null) }
    )
  }

  const adicionarNovaTarefa = () => {
    if (!formNova.titulo.trim() || !user) return
    const prazoFinal = obterPrazo(formNova)

    createTarefa.mutate(
      {
        titulo: formNova.titulo,
        prioridade: formNova.prioridade,
        data_limite: prazoFinal !== "Sem prazo" ? prazoFinal : null,
        coluna: formNova.coluna,
        status: formNova.coluna === "concluido" ? "concluido" : "pendente",
        descricao: formNova.descricao || null,
        xp_recompensa: XP_RECOMPENSA_TAREFA_NOVA,
        ordem: 0,
        tags: [],
      },
      { onSuccess: () => setNovaTarefaAberta(false) }
    )
  }

  const aprovarPendencia = (pendencia: Pendencia) => {
    if (!user) return
    createTarefa.mutate(
      {
        titulo: pendencia.titulo,
        prioridade: pendencia.prioridade,
        data_limite: pendencia.data_vencimento || null,
        coluna: "a_fazer",
        status: "pendente",
        descricao: pendencia.descricao || null,
        xp_recompensa: XP_RECOMPENSA_PENDENCIA_APROVADA,
        ordem: 0,
        tags: [],
      },
      { onSuccess: () => deletePendencia.mutate(pendencia.id) }
    )
  }

  const adicionarPendencia = () => {
    if (!novaPendenciaTexto.trim() || !user) return
    createPendencia.mutate(
      {
        titulo: novaPendenciaTexto.trim(),
        prazo: "Hoje",
        prioridade: "media",
        categoria: null,
        descricao: null,
        data_vencimento: null,
      },
      {
        onSuccess: () => {
          setNovaPendenciaTexto("")
          setMostrarCampoPendencia(false)
        },
      }
    )
  }

  const handleExcluir = useCallback(
    async (tarefa: Tarefa) => {
      const confirmado = await confirmarCom(tarefa)
      if (confirmado) {
        deleteTarefa.mutate(tarefa.id)
      }
    },
    [confirmarCom, deleteTarefa]
  )

  const concluirTarefa = useCallback(
    (tarefa: Tarefa) => {
      moverTarefa.mutate({ id: tarefa.id, novoEstagio: "concluido", novaOrdem: 0 })
    },
    [moverTarefa]
  )

  // Loading state
  if (carregandoTarefas) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <EsqueletoKanban cartoesPorColuna={[3, 2, 2, 1]} />
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <AnimacaoPagina className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
          <FiltrosTarefas
            buscaTarefa={buscaTarefa}
            onBuscaChange={setBuscaTarefa}
            pendencias={pendencias}
            carregandoPendencias={carregandoPendencias}
            pendenciasAberto={pendenciasAberto}
            setPendenciasAberto={setPendenciasAberto}
            onAprovarPendencia={aprovarPendencia}
            aprovandoPendencia={createTarefa.isPending}
            mostrarCampoPendencia={mostrarCampoPendencia}
            setMostrarCampoPendencia={setMostrarCampoPendencia}
            novaPendenciaTexto={novaPendenciaTexto}
            setNovaPendenciaTexto={setNovaPendenciaTexto}
            onAdicionarPendencia={adicionarPendencia}
            criandoPendencia={createPendencia.isPending}
            novaTarefaAberta={novaTarefaAberta}
            setNovaTarefaAberta={setNovaTarefaAberta}
            formNova={formNova}
            onAtualizarFormNova={atualizarFormNova}
            onAdicionarNovaTarefa={adicionarNovaTarefa}
            criandoTarefa={createTarefa.isPending}
            tarefaEditando={tarefaEditando}
            setTarefaEditando={setTarefaEditando}
            formEdicao={formEdicao}
            onAtualizarFormEdicao={atualizarFormEdicao}
            onSalvarEdicao={salvarEdicao}
            salvandoEdicao={updateTarefa.isPending}
            confirmarExclusaoAberto={confirmarExclusaoAberto}
            tarefaParaExcluir={tarefaParaExcluir}
            onConfirmarExclusao={onConfirmarExclusao}
            onCancelarExclusao={onCancelarExclusao}
          />

          {tarefas.length === 0 ? (
            <EstadoVazioTarefas
              acao={
                <Botao
                  onClick={() => setNovaTarefaAberta(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nova tarefa
                </Botao>
              }
            />
          ) : (
            <KanbanBoard
              colunas={tarefasPorEstagio}
              aoFinalizarArraste={aoFinalizarArraste}
              onEditar={abrirEdicaoTarefa}
              onExcluir={handleExcluir}
              onConcluir={concluirTarefa}
            />
          )}
        </AnimacaoPagina>
      </main>
    </ErrorBoundary>
  )
}
