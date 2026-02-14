"use client"

import * as React from "react"

import {
  cancelFocusSession,
  completeFocusSession,
  createFocusSession,
  getActiveSession,
  getAvailableTasks,
  getFocusStats,
  markTaskAsCompleted,
  savePartialSession,
  updateFocusSession,
} from "@/app/(protegido)/foco/actions"
import type {
  ActiveSessionState,
  FocusPause,
  FocusStatsDisplay,
  FocusTask,
} from "@/app/(protegido)/foco/types"

interface UseFocoSessaoOptions {
  modoSelecionado: string
  totalSegundos: number
  tempoFocadoAtual: number
  segundosRestantes: number
  setSegundosRestantes: React.Dispatch<React.SetStateAction<number>>
  setRodando: React.Dispatch<React.SetStateAction<boolean>>
  setEstadoHidratado: React.Dispatch<React.SetStateAction<boolean>>
  alarmeDisparadoRef: React.MutableRefObject<boolean>
  prepararSom: () => void
  tocarAlarme: () => void
  // Data callbacks
  setUsuario: React.Dispatch<
    React.SetStateAction<{ name: string; totalXp: number; level: number } | null>
  >
  usuario: { name: string; totalXp: number; level: number } | null
  setEstatisticas: React.Dispatch<React.SetStateAction<FocusStatsDisplay | null>>
  setTarefasDisponiveis: React.Dispatch<React.SetStateAction<FocusTask[]>>
  setErro: React.Dispatch<React.SetStateAction<string | null>>
  carregarDados: () => Promise<void>
  carregarHistorico: (pagina: number) => Promise<void>
}

interface UseFocoSessaoReturn {
  sessionId: string | null
  sessaoIniciada: boolean
  sessaoConcluida: boolean
  xpGanho: number
  levelUp: boolean
  mostrarModalTarefa: boolean
  setMostrarModalTarefa: React.Dispatch<React.SetStateAction<boolean>>
  pausas: FocusPause[]
  tarefaSelecionada: string
  setTarefaSelecionada: React.Dispatch<React.SetStateAction<string>>
  iniciarSessao: () => Promise<void>
  alternarSessao: () => void
  finalizarSessao: () => Promise<void>
  encerrarSessao: () => Promise<void>
  reiniciarSessao: () => Promise<void>
  atualizarModalConclusao: (aberto: boolean) => void
  marcarTarefaConcluida: () => Promise<void>
  inicializarSessao: () => Promise<void>
  // UI helpers
  textoBotaoControle: string
}

export function useFocoSessao(options: UseFocoSessaoOptions): UseFocoSessaoReturn {
  const {
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
  } = options

  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [sessaoIniciada, setSessaoIniciada] = React.useState(false)
  const [sessaoStartedAt, setSessaoStartedAt] = React.useState<string | null>(null)
  const [pausas, setPausas] = React.useState<FocusPause[]>([])
  const [pausaAtualInicio, setPausaAtualInicio] = React.useState<string | null>(null)
  const [sessaoConcluida, setSessaoConcluida] = React.useState(false)
  const [xpGanho, setXpGanho] = React.useState(0)
  const [levelUp, setLevelUp] = React.useState(false)
  const [mostrarModalTarefa, setMostrarModalTarefa] = React.useState(false)
  const [tarefaSelecionada, setTarefaSelecionada] = React.useState("")

  const rodandoRef = React.useRef(false)

  // Keep ref in sync for sendBeacon closure
  React.useEffect(() => {
    rodandoRef.current = sessaoIniciada
  }, [sessaoIniciada])

  // LocalStorage helpers
  const salvarEstadoLocal = React.useCallback((estado: ActiveSessionState) => {
    try {
      localStorage.setItem("foco-sessao", JSON.stringify(estado))
    } catch {
      // Ignore
    }
  }, [])

  const limparEstadoLocal = React.useCallback(() => {
    try {
      localStorage.removeItem("foco-sessao")
    } catch {
      // Ignore
    }
  }, [])

  const resetarSessao = React.useCallback(() => {
    setSessionId(null)
    setSessaoIniciada(false)
    setSessaoConcluida(false)
    setRodando(false)
    setSegundosRestantes(totalSegundos)
    setPausas([])
    setPausaAtualInicio(null)
    alarmeDisparadoRef.current = false
  }, [totalSegundos, setRodando, setSegundosRestantes, alarmeDisparadoRef])

  const iniciarSessao = React.useCallback(async () => {
    prepararSom()
    alarmeDisparadoRef.current = false

    const duracaoSegundos = totalSegundos || 1500

    const res = await createFocusSession({
      taskId: tarefaSelecionada || null,
      modo: modoSelecionado,
      duracaoPlanejada: duracaoSegundos,
    })

    if (res.success && res.data) {
      setSessionId(res.data.sessionId)
      setSegundosRestantes(duracaoSegundos)
      setSessaoIniciada(true)
      setSessaoConcluida(false)
      setRodando(true)
      setPausas([])
      setPausaAtualInicio(null)
      setSessaoStartedAt(new Date().toISOString())

      salvarEstadoLocal({
        sessionId: res.data.sessionId,
        taskId: tarefaSelecionada || null,
        modo: modoSelecionado,
        duracaoPlanejada: duracaoSegundos,
        segundosRestantes: duracaoSegundos,
        rodando: true,
        pausas: [],
        startedAt: new Date().toISOString(),
        currentPauseStart: null,
      })
    } else {
      setErro(res.error ?? "Erro ao iniciar sessão")
    }
  }, [
    prepararSom,
    alarmeDisparadoRef,
    totalSegundos,
    tarefaSelecionada,
    modoSelecionado,
    setSegundosRestantes,
    setRodando,
    setErro,
    salvarEstadoLocal,
  ])

  const finalizarSessao = React.useCallback(async () => {
    if (!sessionId) return

    setRodando(false)
    tocarAlarme()

    const res = await completeFocusSession({
      sessionId,
      duracaoReal: tempoFocadoAtual,
    })

    if (res.success && res.data) {
      setXpGanho(res.data.xpEarned)
      setLevelUp(res.data.levelUp)

      if (usuario) {
        setUsuario({
          ...usuario,
          totalXp: res.data.newTotalXp,
          level: res.data.newLevel,
        })
      }
    }

    setSessaoConcluida(true)
    limparEstadoLocal()

    await Promise.all([
      getFocusStats().then((r) => r.success && r.data && setEstatisticas(r.data)),
      carregarHistorico(1),
    ])

    if (tarefaSelecionada) {
      setMostrarModalTarefa(true)
    }
  }, [
    sessionId,
    setRodando,
    tocarAlarme,
    tempoFocadoAtual,
    usuario,
    setUsuario,
    setEstatisticas,
    carregarHistorico,
    tarefaSelecionada,
    limparEstadoLocal,
  ])

  const pausarSessao = React.useCallback(async () => {
    setRodando(false)
    const pauseStart = new Date().toISOString()
    setPausaAtualInicio(pauseStart)

    if (sessionId) {
      await updateFocusSession({
        sessionId,
        status: "paused",
        duracaoReal: tempoFocadoAtual,
      })

      salvarEstadoLocal({
        sessionId,
        taskId: tarefaSelecionada || null,
        modo: modoSelecionado,
        duracaoPlanejada: totalSegundos,
        segundosRestantes,
        rodando: false,
        pausas,
        startedAt: sessaoStartedAt ?? new Date().toISOString(),
        currentPauseStart: pauseStart,
      })
    }
  }, [
    setRodando,
    sessionId,
    tempoFocadoAtual,
    tarefaSelecionada,
    modoSelecionado,
    totalSegundos,
    segundosRestantes,
    pausas,
    sessaoStartedAt,
    salvarEstadoLocal,
  ])

  const retomarSessao = React.useCallback(async () => {
    prepararSom()

    if (pausaAtualInicio) {
      const pausaDuracao = Math.floor(
        (Date.now() - new Date(pausaAtualInicio).getTime()) / 1000
      )
      const novaPausa: FocusPause = {
        started_at: pausaAtualInicio,
        ended_at: new Date().toISOString(),
        duration: pausaDuracao,
      }
      const novasPausas = [...pausas, novaPausa]
      setPausas(novasPausas)
      setPausaAtualInicio(null)

      if (sessionId) {
        await updateFocusSession({
          sessionId,
          status: "active",
          pausas: novasPausas,
        })
      }
    }

    setRodando(true)

    if (sessionId) {
      salvarEstadoLocal({
        sessionId,
        taskId: tarefaSelecionada || null,
        modo: modoSelecionado,
        duracaoPlanejada: totalSegundos,
        segundosRestantes,
        rodando: true,
        pausas,
        startedAt: sessaoStartedAt ?? new Date().toISOString(),
        currentPauseStart: null,
      })
    }
  }, [
    prepararSom,
    pausaAtualInicio,
    pausas,
    sessionId,
    setRodando,
    tarefaSelecionada,
    modoSelecionado,
    totalSegundos,
    segundosRestantes,
    sessaoStartedAt,
    salvarEstadoLocal,
  ])

  const alternarSessao = React.useCallback(() => {
    if (!sessaoIniciada) {
      iniciarSessao()
      return
    }
    // Check if timer is running by looking at current rodando state from options
    // We use a ref to avoid stale closure
    if (rodandoRef.current) {
      pausarSessao()
    } else {
      retomarSessao()
    }
  }, [sessaoIniciada, iniciarSessao, pausarSessao, retomarSessao])

  const encerrarSessao = React.useCallback(async () => {
    if (sessionId) {
      await cancelFocusSession(sessionId)
    }
    resetarSessao()
    limparEstadoLocal()
  }, [sessionId, resetarSessao, limparEstadoLocal])

  const reiniciarSessao = React.useCallback(async () => {
    if (sessionId) {
      await cancelFocusSession(sessionId)
    }
    setSessionId(null)
    setSessaoIniciada(false)
    setSessaoConcluida(false)
    setRodando(false)
    setSegundosRestantes(totalSegundos)
    setPausas([])
    setPausaAtualInicio(null)
    alarmeDisparadoRef.current = false
    limparEstadoLocal()
  }, [sessionId, totalSegundos, setRodando, setSegundosRestantes, alarmeDisparadoRef, limparEstadoLocal])

  const atualizarModalConclusao = React.useCallback(
    (aberto: boolean) => {
      setSessaoConcluida(aberto)
      if (!aberto) {
        resetarSessao()
      }
    },
    [resetarSessao]
  )

  const marcarTarefaConcluida = React.useCallback(async () => {
    if (!tarefaSelecionada) return

    await markTaskAsCompleted(tarefaSelecionada)
    setMostrarModalTarefa(false)

    const res = await getAvailableTasks()
    if (res.success && res.data) {
      setTarefasDisponiveis(res.data)
      setTarefaSelecionada(res.data.length > 0 ? res.data[0].id : "")
    }
  }, [tarefaSelecionada, setTarefasDisponiveis])

  // Initialize: load data + restore session
  const inicializarSessao = React.useCallback(async () => {
    await carregarDados()

    // Restore from localStorage
    try {
      const armazenado = localStorage.getItem("foco-sessao")
      if (!armazenado) {
        setSegundosRestantes(totalSegundos)
        setEstadoHidratado(true)
        return
      }

      const estado: ActiveSessionState = JSON.parse(armazenado)
      const activeRes = await getActiveSession()

      if (!activeRes.success || !activeRes.data) {
        limparEstadoLocal()
        setSegundosRestantes(totalSegundos)
        setEstadoHidratado(true)
        return
      }

      // Restore state
      setSessionId(estado.sessionId)
      setTarefaSelecionada(estado.taskId ?? "")
      setPausas(estado.pausas)
      setSessaoStartedAt(estado.startedAt)
      setSessaoIniciada(true)

      if (estado.rodando) {
        const tempoDecorrido = Math.floor(
          (Date.now() - new Date(estado.startedAt).getTime()) / 1000
        )
        const tempoEmPausas = estado.pausas.reduce((acc, p) => acc + p.duration, 0)
        const tempoFocado = tempoDecorrido - tempoEmPausas
        const restante = Math.max(0, estado.duracaoPlanejada - tempoFocado)

        if (restante > 0) {
          setSegundosRestantes(restante)
          setRodando(true)
        } else {
          setSegundosRestantes(0)
          setRodando(false)
        }
      } else {
        setSegundosRestantes(estado.segundosRestantes)
        setRodando(false)
        if (estado.currentPauseStart) {
          setPausaAtualInicio(estado.currentPauseStart)
        }
      }
    } catch {
      limparEstadoLocal()
      setSegundosRestantes(totalSegundos)
    }

    setEstadoHidratado(true)
  }, [
    carregarDados,
    totalSegundos,
    setSegundosRestantes,
    setRodando,
    setEstadoHidratado,
    limparEstadoLocal,
  ])

  // Save state to localStorage on changes
  React.useEffect(() => {
    if (!sessionId || !sessaoIniciada) return

    salvarEstadoLocal({
      sessionId,
      taskId: tarefaSelecionada || null,
      modo: modoSelecionado,
      duracaoPlanejada: totalSegundos,
      segundosRestantes,
      rodando: rodandoRef.current,
      pausas,
      startedAt: sessaoStartedAt ?? new Date().toISOString(),
      currentPauseStart: pausaAtualInicio,
    })
  }, [
    sessionId,
    sessaoIniciada,
    segundosRestantes,
    pausas,
    pausaAtualInicio,
    tarefaSelecionada,
    modoSelecionado,
    totalSegundos,
    sessaoStartedAt,
    salvarEstadoLocal,
  ])

  // Save session on page unload
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId && sessaoIniciada && tempoFocadoAtual > 0) {
        savePartialSession({
          sessionId,
          duracaoReal: tempoFocadoAtual,
          pausas,
        })
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [sessionId, sessaoIniciada, tempoFocadoAtual, pausas])

  // UI helpers
  const textoBotaoControle = sessaoIniciada
    ? pausaAtualInicio
      ? "Retomar"
      : "Pausar"
    : "Iniciar"

  return {
    sessionId,
    sessaoIniciada,
    sessaoConcluida,
    xpGanho,
    levelUp,
    mostrarModalTarefa,
    setMostrarModalTarefa,
    pausas,
    tarefaSelecionada,
    setTarefaSelecionada,
    iniciarSessao,
    alternarSessao,
    finalizarSessao,
    encerrarSessao,
    reiniciarSessao,
    atualizarModalConclusao,
    marcarTarefaConcluida,
    inicializarSessao,
    textoBotaoControle,
  }
}
