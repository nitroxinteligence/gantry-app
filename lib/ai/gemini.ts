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
        descricao: { type: Type.STRING, description: 'Descricao detalhada da tarefa (opcional)' },
        prioridade: { type: Type.STRING, description: 'Prioridade: baixa, media, alta ou urgente', enum: ['baixa', 'media', 'alta', 'urgente'] },
        data_limite: { type: Type.STRING, description: 'Data limite no formato YYYY-MM-DD (opcional)' },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'editar_tarefa',
    description: 'Edita uma tarefa existente no quadro Kanban. Requer o ID da tarefa (primeiros 8 chars do UUID).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tarefa_id: { type: Type.STRING, description: 'UUID da tarefa a editar' },
        titulo: { type: Type.STRING, description: 'Novo titulo' },
        descricao: { type: Type.STRING, description: 'Nova descricao' },
        prioridade: { type: Type.STRING, description: 'Nova prioridade', enum: ['baixa', 'media', 'alta', 'urgente'] },
        coluna: { type: Type.STRING, description: 'Mover para coluna', enum: ['backlog', 'a_fazer', 'em_andamento'] },
        data_limite: { type: Type.STRING, description: 'Nova data limite YYYY-MM-DD (ou vazio para remover)' },
      },
      required: ['tarefa_id'],
    },
  },
  {
    name: 'excluir_tarefa',
    description: 'Exclui permanentemente uma tarefa do quadro Kanban',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tarefa_id: { type: Type.STRING, description: 'UUID da tarefa a excluir' },
      },
      required: ['tarefa_id'],
    },
  },
  {
    name: 'concluir_tarefa',
    description: 'Marca uma tarefa como concluida e ganha XP',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tarefa_id: { type: Type.STRING, description: 'UUID da tarefa a concluir' },
      },
      required: ['tarefa_id'],
    },
  },
  {
    name: 'criar_habito',
    description: 'Cria um novo habito para o usuario acompanhar diariamente',
    parameters: {
      type: Type.OBJECT,
      properties: {
        titulo: { type: Type.STRING, description: 'Titulo do habito' },
        descricao: { type: Type.STRING, description: 'Descricao do habito (opcional)' },
        frequencia: { type: Type.STRING, description: 'Frequencia: diario ou semanal', enum: ['diario', 'semanal'] },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'editar_habito',
    description: 'Edita um habito existente',
    parameters: {
      type: Type.OBJECT,
      properties: {
        habito_id: { type: Type.STRING, description: 'UUID do habito' },
        titulo: { type: Type.STRING, description: 'Novo titulo' },
        descricao: { type: Type.STRING, description: 'Nova descricao' },
        frequencia: { type: Type.STRING, description: 'Nova frequencia', enum: ['diario', 'semanal'] },
      },
      required: ['habito_id'],
    },
  },
  {
    name: 'excluir_habito',
    description: 'Exclui permanentemente um habito',
    parameters: {
      type: Type.OBJECT,
      properties: {
        habito_id: { type: Type.STRING, description: 'UUID do habito' },
      },
      required: ['habito_id'],
    },
  },
  {
    name: 'marcar_habito',
    description: 'Marca um habito como feito hoje, ganhando XP e atualizando o streak',
    parameters: {
      type: Type.OBJECT,
      properties: {
        habito_id: { type: Type.STRING, description: 'UUID do habito' },
      },
      required: ['habito_id'],
    },
  },
  {
    name: 'criar_meta',
    description: 'Cria uma nova meta para o usuario acompanhar',
    parameters: {
      type: Type.OBJECT,
      properties: {
        titulo: { type: Type.STRING, description: 'Titulo da meta' },
        descricao: { type: Type.STRING, description: 'Descricao da meta (opcional)' },
        progresso_total: { type: Type.NUMBER, description: 'Valor total a atingir (ex: 100 para 100 push-ups)' },
        unidade: { type: Type.STRING, description: 'Unidade de medida (ex: push-ups, livros, km)' },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'editar_meta',
    description: 'Edita uma meta existente (titulo, progresso ou status)',
    parameters: {
      type: Type.OBJECT,
      properties: {
        meta_id: { type: Type.STRING, description: 'UUID da meta' },
        titulo: { type: Type.STRING, description: 'Novo titulo' },
        progresso_atual: { type: Type.NUMBER, description: 'Novo valor do progresso atual' },
        status: { type: Type.STRING, description: 'Novo status', enum: ['a_fazer', 'em_andamento', 'concluido'] },
      },
      required: ['meta_id'],
    },
  },
  {
    name: 'excluir_meta',
    description: 'Exclui permanentemente uma meta',
    parameters: {
      type: Type.OBJECT,
      properties: {
        meta_id: { type: Type.STRING, description: 'UUID da meta' },
      },
      required: ['meta_id'],
    },
  },
  {
    name: 'criar_pendencia',
    description: 'Cria uma pendencia rapida (item que ainda nao e tarefa)',
    parameters: {
      type: Type.OBJECT,
      properties: {
        titulo: { type: Type.STRING, description: 'Titulo da pendencia' },
        descricao: { type: Type.STRING, description: 'Descricao (opcional)' },
        prioridade: { type: Type.STRING, description: 'Prioridade', enum: ['baixa', 'media', 'alta', 'urgente'] },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'agendar_foco',
    description: 'Sugere iniciar uma sessao de foco com duracao e modo especificos',
    parameters: {
      type: Type.OBJECT,
      properties: {
        duracao_minutos: { type: Type.NUMBER, description: 'Duracao em minutos' },
        modo: { type: Type.STRING, description: 'Modo de foco', enum: ['pomodoro', 'deep_work', 'flowtime'] },
      },
      required: ['duracao_minutos'],
    },
  },
  {
    name: 'analisar_performance',
    description: 'Gera uma analise detalhada da performance do usuario baseada em todos os dados disponíveis',
    parameters: {
      type: Type.OBJECT,
      properties: {},
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
    contents: 'Gere o briefing matinal completo para hoje, analisando 100% dos meus dados.',
    config: { systemInstruction },
  })

  return response.text ?? 'Nao foi possivel gerar o briefing.'
}
