"use client"

import * as React from "react"

import { Botao } from "@/componentes/ui/botao"
import { AnimacaoPagina, SecaoAnimada } from "@/componentes/ui/animacoes"
import { ConfiguracaoTimer } from "@/componentes/foco/configuracao-timer"
import { EstatisticasFoco } from "@/componentes/foco/estatisticas-foco"
import { HistoricoSessoes } from "@/componentes/foco/historico-sessoes"
import { ModalConclusao } from "@/componentes/foco/modal-conclusao"
import { ModalTarefa } from "@/componentes/foco/modal-tarefa"
import { TimerDisplay } from "@/componentes/foco/timer-display"
import { useFocoTimer } from "@/hooks/useFocoTimer"
import { useFocoHistorico } from "@/hooks/useFocoHistorico"
import { useFocoSessao } from "@/hooks/useFocoSessao"

export default function PaginaFoco() {
  const inicializadoRef = React.useRef(false)

  // =========================================================================
  // DATA HOOK
  // =========================================================================
  const {
    usuario,
    setUsuario,
    tarefasDisponiveis,
    setTarefasDisponiveis,
    estatisticas,
    setEstatisticas,
    historico,
    historicoTotal,
    historicoPagina,
    carregandoHistorico,
    carregando,
    erro,
    setErro,
    carregarDados,
    carregarHistorico,
  } = useFocoHistorico()

  // =========================================================================
  // TIMER HOOK
  // =========================================================================
  const {
    modoSelecionado,
    modoAtual,
    duracaoPersonalizada,
    totalSegundos,
    aoSelecionarModo,
    aoAtualizarDuracaoPersonalizada,
    segundosRestantes,
    setSegundosRestantes,
    rodando,
    setRodando,
    progresso,
    angulo,
    tempoFocadoAtual,
    somAtivado,
    setSomAtivado,
    prepararSom,
    tocarAlarme,
    testarSom,
    estadoHidratado,
    setEstadoHidratado,
    alarmeDisparadoRef,
  } = useFocoTimer({
    onComplete: () => {
      // This will be called by the timer hook when countdown reaches 0.
      // The actual finalizarSessao is called from the session hook below.
      // We rely on the effect-based approach in useFocoSessao.
    },
  })

  // =========================================================================
  // SESSION HOOK
  // =========================================================================
  const {
    sessaoIniciada,
    sessaoConcluida,
    xpGanho,
    levelUp,
    mostrarModalTarefa,
    setMostrarModalTarefa,
    tarefaSelecionada,
    setTarefaSelecionada,
    alternarSessao,
    finalizarSessao,
    encerrarSessao,
    reiniciarSessao,
    atualizarModalConclusao,
    marcarTarefaConcluida,
    inicializarSessao,
  } = useFocoSessao({
    modoSelecionado,
    totalSegundos,
    tempoFocadoAtual,
    segundosRestantes,
    setSegundosRestantes,
    setRodando,
    setEstadoHidratado,
    alarmeDisparadoRef,
    prepararSom,
    tocarAlarme,
    setUsuario,
    usuario,
    setEstatisticas,
    setTarefasDisponiveis,
    setErro,
    carregarDados,
    carregarHistorico,
  })

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================
  const tarefaAtual = tarefasDisponiveis.find(
    (tarefa) => tarefa.id === tarefaSelecionada
  )

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  React.useEffect(() => {
    if (inicializadoRef.current) return
    inicializadoRef.current = true
    inicializarSessao()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wire up the timer onComplete to actually call finalizarSessao
  React.useEffect(() => {
    if (!rodando || !estadoHidratado) return
    if (segundosRestantes <= 0) {
      if (!alarmeDisparadoRef.current) {
        alarmeDisparadoRef.current = true
        finalizarSessao()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando, segundosRestantes, estadoHidratado])

  // =========================================================================
  // SOUND TOGGLE HANDLER
  // =========================================================================
  const alternarSom = () => {
    setSomAtivado((prev) => {
      const novoValor = !prev
      if (novoValor) {
        prepararSom()
      }
      return novoValor
    })
  }

  // =========================================================================
  // MODE CHANGE HANDLER (blocks during session)
  // =========================================================================
  const aoSelecionarModoProtegido = (valor: string) => {
    if (sessaoIniciada) return
    aoSelecionarModo(valor)
  }

  const aoAtualizarDuracaoProtegida = (valor: number) => {
    if (sessaoIniciada) return
    aoAtualizarDuracaoPersonalizada(valor)
  }

  // =========================================================================
  // RENDER
  // =========================================================================
  if (carregando) {
    return (
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:gap-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-7 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-[color:var(--borda-cartao)] bg-card" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl border border-[color:var(--borda-cartao)] bg-card" />
          <div className="flex justify-center">
            <div className="h-64 w-64 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Exibição de Erro */}
      {erro && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <div className="mx-auto max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            <p className="text-sm font-medium">{erro}</p>
            <Botao
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setErro(null)
                carregarDados()
              }}
            >
              Tentar novamente
            </Botao>
          </div>
        </div>
      )}

      {/* Modal: Sessão Concluída */}
      <ModalConclusao
        aberto={sessaoConcluida}
        onOpenChange={atualizarModalConclusao}
        levelUp={levelUp}
        nivelUsuario={usuario?.level ?? 1}
        tituloTarefa={tarefaAtual?.titulo ?? null}
        tempoFocadoAtual={tempoFocadoAtual}
        xpGanho={xpGanho}
      />

      {/* Modal: Marcar Tarefa como Concluída */}
      <ModalTarefa
        aberto={mostrarModalTarefa}
        onOpenChange={setMostrarModalTarefa}
        tarefaAtual={tarefaAtual}
        onMarcarConcluida={marcarTarefaConcluida}
      />

      <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
          <AnimacaoPagina className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:gap-10">
            {/* Header */}
            <SecaoAnimada className="flex items-center gap-3">
              <div>
                <h1 className="font-titulo text-2xl font-semibold">Foco</h1>
                <p className="text-sm text-muted-foreground">
                  Modo imersivo para sessões profundas.
                </p>
              </div>
            </SecaoAnimada>

            {/* Stats Cards */}
            {estatisticas && (
              <SecaoAnimada>
                <EstatisticasFoco estatisticas={estatisticas} />
              </SecaoAnimada>
            )}

            {/* Task and Mode Selection */}
            <ConfiguracaoTimer
              modoSelecionado={modoSelecionado}
              aoSelecionarModo={aoSelecionarModoProtegido}
              tarefaSelecionada={tarefaSelecionada}
              aoSelecionarTarefa={setTarefaSelecionada}
              tarefasDisponiveis={tarefasDisponiveis}
              duracaoPersonalizada={duracaoPersonalizada}
              aoAtualizarDuracaoPersonalizada={aoAtualizarDuracaoProtegida}
              sessaoIniciada={sessaoIniciada}
            />

            {/* Timer */}
            <TimerDisplay
              segundosRestantes={segundosRestantes}
              totalSegundos={totalSegundos}
              progresso={progresso}
              angulo={angulo}
              modoAtual={modoAtual}
              tarefaAtual={tarefaAtual}
              rodando={rodando}
              sessaoIniciada={sessaoIniciada}
              tempoFocadoAtual={tempoFocadoAtual}
              somAtivado={somAtivado}
              onAlternarSessao={alternarSessao}
              onReiniciarSessao={reiniciarSessao}
              onEncerrarSessao={encerrarSessao}
              onAlternarSom={alternarSom}
              onTestarSom={testarSom}
            />

            {/* History */}
            <HistoricoSessoes
              historico={historico}
              historicoTotal={historicoTotal}
              historicoPagina={historicoPagina}
              carregandoHistorico={carregandoHistorico}
              onCarregarHistorico={carregarHistorico}
            />
          </AnimacaoPagina>
        </main>
    </>
  )
}
