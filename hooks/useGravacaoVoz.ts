'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

interface GravacaoState {
  isGravando: boolean
  duracao: number
  audioUrl: string | null
}

export function useGravacaoVoz(onTranscricao: (texto: string) => void) {
  const [state, setState] = useState<GravacaoState>({
    isGravando: false,
    duracao: 0,
    audioUrl: null,
  })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

        transcreverAudio(blob)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(250)

      let segundos = 0
      timerRef.current = setInterval(() => {
        segundos += 1
        setState(prev => ({ ...prev, duracao: segundos }))
      }, 1000)

      setState({ isGravando: true, duracao: 0, audioUrl: null })
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
  }, [])

  const parar = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const transcreverAudio = useCallback(async (blob: Blob) => {
    try {
      // Usa a Web Speech API para transcrever (fallback sem custo de API)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // Speech Recognition via Web API nao funciona com blob,
        // entao usamos como indicador para o usuario digitar
        toast.info('Gravacao concluida', {
          description: 'Transcrição de voz sera implementada com a API do Gemini.',
        })

        // Fallback: informar o usuario que o audio foi capturado
        const duracao = Math.round(blob.size / 1024)
        onTranscricao(`[Audio gravado: ${duracao}KB]`)
        return
      }

      onTranscricao('[Audio gravado - transcrição pendente]')
    } catch {
      toast.error('Erro na transcricao')
    }
  }, [onTranscricao])

  const limpar = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl)
    }
    setState({ isGravando: false, duracao: 0, audioUrl: null })
  }, [state.audioUrl])

  const formatarDuracao = useCallback((segundos: number): string => {
    const min = Math.floor(segundos / 60)
    const sec = segundos % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }, [])

  return {
    ...state,
    iniciar,
    parar,
    limpar,
    formatarDuracao,
  }
}
