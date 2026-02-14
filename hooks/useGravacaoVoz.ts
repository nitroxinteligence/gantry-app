'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface GravacaoState {
  isGravando: boolean
  isTranscrevendo: boolean
  duracao: number
  audioUrl: string | null
}

function getSpeechRecognitionClass(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => SpeechRecognitionInstance) | null
}

export function useGravacaoVoz(onTranscricao: (texto: string) => void) {
  const [state, setState] = useState<GravacaoState>({
    isGravando: false,
    isTranscrevendo: false,
    duracao: 0,
    audioUrl: null,
  })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const iniciarTranscricaoRealTime = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionClass()
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    let textoAcumulado = ''

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultado = event.results[i]
        if (resultado?.[0] && resultado.isFinal) {
          const transcricao = resultado[0].transcript.trim()
          if (transcricao) {
            textoAcumulado = textoAcumulado
              ? `${textoAcumulado} ${transcricao}`
              : transcricao
          }
        }
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast.error('Erro no reconhecimento de voz', {
          description: event.error === 'not-allowed'
            ? 'Permissao de microfone negada.'
            : `Erro: ${event.error}`,
        })
      }
    }

    recognition.onend = () => {
      setState(prev => ({ ...prev, isTranscrevendo: false }))
      if (textoAcumulado) {
        onTranscricao(textoAcumulado)
      }
    }

    recognitionRef.current = recognition
    return recognition
  }, [onTranscricao])

  const iniciar = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current = [...chunksRef.current, event.data]
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())

        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setState(prev => ({ ...prev, isGravando: false, audioUrl: url }))
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(250)

      let segundos = 0
      timerRef.current = setInterval(() => {
        segundos += 1
        setState(prev => ({ ...prev, duracao: segundos }))
      }, 1000)

      setState({ isGravando: true, isTranscrevendo: true, duracao: 0, audioUrl: null })

      const recognition = iniciarTranscricaoRealTime()
      if (recognition) {
        try {
          recognition.start()
        } catch {
          setState(prev => ({ ...prev, isTranscrevendo: false }))
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
        toast.error('Permissao de microfone negada', {
          description: 'Habilite o microfone nas configuracoes do navegador.',
        })
      } else {
        toast.error('Erro ao iniciar gravacao', { description: msg })
      }
    }
  }, [iniciarTranscricaoRealTime])

  const parar = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // recognition pode ja ter parado
      }
      recognitionRef.current = null
    }
  }, [])

  const limpar = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl)
    }
    setState({ isGravando: false, isTranscrevendo: false, duracao: 0, audioUrl: null })
  }, [state.audioUrl])

  const formatarDuracao = useCallback((segundos: number): string => {
    const min = Math.floor(segundos / 60)
    const sec = segundos % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }, [])

  const temSuporte = typeof window !== 'undefined' && getSpeechRecognitionClass() !== null

  return {
    ...state,
    iniciar,
    parar,
    limpar,
    formatarDuracao,
    temSuporte,
  }
}
