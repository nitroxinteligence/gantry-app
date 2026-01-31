"use client"

import * as React from "react"
import {
  Check,
  Loader2,
  Plus,
  Search,
  Settings,
} from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoFechar,
  DialogoGatilho,
  DialogoRodape,
  DialogoTitulo,
} from "@/componentes/ui/dialogo"
import { ConfirmarExclusao } from "@/componentes/ui/confirmar"
import type { Pendencia, Tarefa } from "@/lib/supabase/types"

import { FormularioTarefaDialogo } from "./formulario-tarefa"
import type { FormularioTarefa } from "./tipos"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type FiltrosTarefasProps = {
  // Busca
  buscaTarefa: string
  onBuscaChange: (valor: string) => void

  // Pendencias dialog
  pendencias: Pendencia[]
  carregandoPendencias: boolean
  pendenciasAberto: boolean
  setPendenciasAberto: (aberto: boolean) => void
  onAprovarPendencia: (pendencia: Pendencia) => void
  aprovandoPendencia: boolean
  // Adicionar pendencia
  mostrarCampoPendencia: boolean
  setMostrarCampoPendencia: (mostrar: boolean) => void
  novaPendenciaTexto: string
  setNovaPendenciaTexto: (texto: string) => void
  onAdicionarPendencia: () => void
  criandoPendencia: boolean

  // Nova tarefa dialog
  novaTarefaAberta: boolean
  setNovaTarefaAberta: (aberta: boolean) => void
  formNova: FormularioTarefa
  onAtualizarFormNova: (parcial: Partial<FormularioTarefa>) => void
  onAdicionarNovaTarefa: () => void
  criandoTarefa: boolean

  // Edicao dialog
  tarefaEditando: Tarefa | null
  setTarefaEditando: (tarefa: Tarefa | null) => void
  formEdicao: FormularioTarefa
  onAtualizarFormEdicao: (parcial: Partial<FormularioTarefa>) => void
  onSalvarEdicao: () => void
  salvandoEdicao: boolean

  // Exclusao dialog
  confirmarExclusaoAberto: boolean
  tarefaParaExcluir: Tarefa | null
  onConfirmarExclusao: () => void
  onCancelarExclusao: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FiltrosTarefas({
  buscaTarefa,
  onBuscaChange,
  pendencias,
  carregandoPendencias,
  pendenciasAberto,
  setPendenciasAberto,
  onAprovarPendencia,
  aprovandoPendencia,
  mostrarCampoPendencia,
  setMostrarCampoPendencia,
  novaPendenciaTexto,
  setNovaPendenciaTexto,
  onAdicionarPendencia,
  criandoPendencia,
  novaTarefaAberta,
  setNovaTarefaAberta,
  formNova,
  onAtualizarFormNova,
  onAdicionarNovaTarefa,
  criandoTarefa,
  tarefaEditando,
  setTarefaEditando,
  formEdicao,
  onAtualizarFormEdicao,
  onSalvarEdicao,
  salvandoEdicao,
  confirmarExclusaoAberto,
  tarefaParaExcluir,
  onConfirmarExclusao,
  onCancelarExclusao,
}: FiltrosTarefasProps) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-titulo text-2xl font-semibold">Tarefas</h1>
          <p className="text-sm text-muted-foreground">
            Kanban de alta produtividade para o dia.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar tarefas"
            value={buscaTarefa}
            onChange={(e) => onBuscaChange(e.target.value)}
            className="h-9 w-52 rounded-md border border-input bg-white pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-card"
          />
        </div>

        {/* Modal Pendencias */}
        <DialogoPendencias
          pendencias={pendencias}
          carregandoPendencias={carregandoPendencias}
          aberto={pendenciasAberto}
          setAberto={setPendenciasAberto}
          onAprovar={onAprovarPendencia}
          aprovando={aprovandoPendencia}
          mostrarCampo={mostrarCampoPendencia}
          setMostrarCampo={setMostrarCampoPendencia}
          texto={novaPendenciaTexto}
          setTexto={setNovaPendenciaTexto}
          onAdicionar={onAdicionarPendencia}
          criando={criandoPendencia}
        />

        {/* Modal Nova Tarefa */}
        <FormularioTarefaDialogo
          aberto={novaTarefaAberta}
          onOpenChange={setNovaTarefaAberta}
          titulo="Nova tarefa"
          descricao="Preencha as informacoes para criar uma nova tarefa."
          formulario={formNova}
          onAtualizar={onAtualizarFormNova}
          onSubmit={onAdicionarNovaTarefa}
          salvando={criandoTarefa}
          textoBotao="Criar tarefa"
          gatilho={
            <DialogoGatilho asChild>
              <Botao className="gap-2">
                <Plus className="h-4 w-4" />
                Nova tarefa
              </Botao>
            </DialogoGatilho>
          }
        />

        <Botao variant="ghost" size="icon" aria-label="Configuracoes">
          <Settings className="h-4 w-4" />
        </Botao>

        {/* Modal Edicao */}
        <FormularioTarefaDialogo
          aberto={Boolean(tarefaEditando)}
          onOpenChange={(aberto) => {
            if (!aberto) setTarefaEditando(null)
          }}
          titulo="Editar tarefa"
          descricao="Atualize os detalhes e o estagio desta tarefa."
          formulario={formEdicao}
          onAtualizar={onAtualizarFormEdicao}
          onSubmit={onSalvarEdicao}
          salvando={salvandoEdicao}
          textoBotao="Salvar alteracoes"
        />

        {/* Dialog Exclusao */}
        <ConfirmarExclusao
          aberto={confirmarExclusaoAberto}
          nomeItem={tarefaParaExcluir?.titulo}
          onConfirmar={onConfirmarExclusao}
          onCancelar={onCancelarExclusao}
        />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Pendencias Dialog (private sub-component)
// ---------------------------------------------------------------------------

type DialogoPendenciasProps = {
  pendencias: Pendencia[]
  carregandoPendencias: boolean
  aberto: boolean
  setAberto: (aberto: boolean) => void
  onAprovar: (pendencia: Pendencia) => void
  aprovando: boolean
  mostrarCampo: boolean
  setMostrarCampo: (mostrar: boolean) => void
  texto: string
  setTexto: (texto: string) => void
  onAdicionar: () => void
  criando: boolean
}

function DialogoPendencias({
  pendencias,
  carregandoPendencias,
  aberto,
  setAberto,
  onAprovar,
  aprovando,
  mostrarCampo,
  setMostrarCampo,
  texto,
  setTexto,
  onAdicionar,
  criando,
}: DialogoPendenciasProps) {
  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        <Botao variant="outline" className="bg-white dark:bg-card">
          Pendentes
          {pendencias.length > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
              {pendencias.length}
            </span>
          )}
        </Botao>
      </DialogoGatilho>
      <DialogoConteudo className="max-w-xl rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Pendentes</DialogoTitulo>
          <DialogoDescricao>
            Organize tarefas pendentes e atribua prioridades.
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="mt-5 space-y-3">
          {carregandoPendencias ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendencias.length ? (
            pendencias.map((pendencia) => (
              <div
                key={pendencia.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{pendencia.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    Prazo: {pendencia.prazo || "Sem prazo"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Botao
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Aprovar pendencia"
                    onClick={() => onAprovar(pendencia)}
                    disabled={aprovando}
                  >
                    <Check className="h-4 w-4 text-muted-foreground" />
                  </Botao>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma pendencia por enquanto.
            </p>
          )}
        </div>
        {mostrarCampo ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  onAdicionar()
                }
              }}
              placeholder="Nova pendencia"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Botao
              type="button"
              variant="secondary"
              size="sm"
              onClick={onAdicionar}
              disabled={criando}
            >
              {criando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Adicionar"
              )}
            </Botao>
          </div>
        ) : null}
        <DialogoRodape className="mt-6 sm:justify-between">
          <Botao
            type="button"
            variant="outline"
            onClick={() => setMostrarCampo(true)}
          >
            Adicionar pendencia
          </Botao>
          <DialogoFechar asChild>
            <Botao>Fechar</Botao>
          </DialogoFechar>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  )
}
