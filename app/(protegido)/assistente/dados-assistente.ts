import {
  BarChart3,
  BookOpenText,
  ClipboardList,
  Target,
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
    descricao: 'Resumo completo do seu dia.',
    itens: ['Tarefas prioritarias', 'Habitos pendentes', 'Plano de acao'],
    acao: 'Me de o briefing matinal completo de hoje, analisando todos os meus dados',
    icone: ClipboardList,
  },
  {
    id: 'performance',
    titulo: 'Analise de performance',
    descricao: 'Como voce esta indo esta semana.',
    itens: ['Taxa de conclusao', 'Foco e produtividade', 'Streaks'],
    acao: 'Faca uma analise completa da minha performance esta semana com insights e sugestoes de melhoria',
    icone: BarChart3,
  },
  {
    id: 'planejar',
    titulo: 'Planejar semana',
    descricao: 'Monte um roteiro com etapas claras.',
    itens: ['Blocos de foco', 'Prioridades', 'Metas da semana'],
    acao: 'Crie um plano de acao detalhado para minha semana baseado nas minhas tarefas, metas e habitos atuais',
    icone: BookOpenText,
  },
  {
    id: 'metas',
    titulo: 'Revisar metas',
    descricao: 'Progresso e proximos passos.',
    itens: ['Status atual', 'Recomendacoes', 'Objetivos'],
    acao: 'Revise o progresso de todas as minhas metas e objetivos de desenvolvimento e sugira proximos passos concretos',
    icone: Target,
  },
]
