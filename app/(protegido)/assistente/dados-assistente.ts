import {
  BarChart3,
  BookOpenText,
  ClipboardList,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react'

export type CartaoSugestao = {
  id: string
  titulo: string
  descricao: string
  itens: string[]
  acao: string
  icone: LucideIcon
}

export const cartoesSugestao: CartaoSugestao[] = [
  {
    id: 'briefing',
    titulo: 'Briefing matinal',
    descricao: 'Resumo do seu dia com prioridades.',
    itens: ['Tarefas do dia', 'Habitos pendentes'],
    acao: 'Me de o briefing matinal de hoje',
    icone: ClipboardList,
  },
  {
    id: 'planejar',
    titulo: 'Criar um plano',
    descricao: 'Monte um roteiro com etapas claras.',
    itens: ['Checklists', 'Prioridades'],
    acao: 'Crie um plano de acao para minha semana',
    icone: BookOpenText,
  },
  {
    id: 'ideias',
    titulo: 'Brainstorm',
    descricao: 'Gere ideias criativas rapidamente.',
    itens: ['Alternativas', 'Sugestoes rapidas'],
    acao: 'Me de ideias para novos habitos',
    icone: Gamepad2,
  },
  {
    id: 'insights',
    titulo: 'Insights visuais',
    descricao: 'Transforme dados em decisoes.',
    itens: ['Tendencias', 'Alertas'],
    acao: 'Analise meu foco da semana',
    icone: BarChart3,
  },
]
