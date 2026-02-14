import { GoogleGenAI, Type } from '@google/genai'
import type { FunctionDeclaration } from '@google/genai'
import type { MensagemChat } from './types'

const GEMINI_MODEL = 'gemini-2.5-flash-preview-05-20'

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nao configurada')
  }
  return new GoogleGenAI({ apiKey })
}

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'criar_tarefa',
    description: 'Cria uma nova tarefa no quadro Kanban do usuario',
    parameters: {
      type: Type.OBJECT,
      properties: {
        titulo: { type: Type.STRING, description: 'Titulo da tarefa' },
        prioridade: { type: Type.STRING, description: 'Prioridade: baixa, media, alta ou urgente', enum: ['baixa', 'media', 'alta', 'urgente'] },
        data_limite: { type: Type.STRING, description: 'Data limite no formato YYYY-MM-DD (opcional)' },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'criar_habito',
    description: 'Cria um novo habito para o usuario acompanhar',
    parameters: {
      type: Type.OBJECT,
      properties: {
        titulo: { type: Type.STRING, description: 'Titulo do habito' },
        frequencia: { type: Type.STRING, description: 'Frequencia: diario ou semanal', enum: ['diario', 'semanal'] },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'agendar_foco',
    description: 'Sugere iniciar uma sessao de foco com duracao especifica',
    parameters: {
      type: Type.OBJECT,
      properties: {
        duracao_minutos: { type: Type.NUMBER, description: 'Duracao em minutos' },
        modo: { type: Type.STRING, description: 'Modo: pomodoro, deep_work, flowtime', enum: ['pomodoro', 'deep_work', 'flowtime'] },
      },
      required: ['duracao_minutos'],
    },
  },
]

export async function* streamChatComGemini(
  historico: MensagemChat[],
  mensagemUsuario: string,
  systemInstruction: string
): AsyncGenerator<string> {
  const ai = getClient()

  const response = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: [
      ...historico.map(m => ({
        role: m.role,
        parts: m.parts,
      })),
      { role: 'user' as const, parts: [{ text: mensagemUsuario }] },
    ],
    config: {
      systemInstruction,
      tools: [{ functionDeclarations }],
    },
  })

  for await (const chunk of response) {
    if (chunk.functionCalls && chunk.functionCalls.length > 0) {
      for (const call of chunk.functionCalls) {
        yield JSON.stringify({
          tipo: 'funcao',
          nome: call.name,
          args: call.args,
        })
      }
    }

    const text = chunk.text
    if (text) {
      yield text
    }
  }
}

export async function gerarBriefingMatinal(
  systemInstruction: string
): Promise<string> {
  const ai = getClient()

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: 'Gere o briefing matinal para hoje.',
    config: { systemInstruction },
  })

  return response.text ?? 'Nao foi possivel gerar o briefing.'
}
