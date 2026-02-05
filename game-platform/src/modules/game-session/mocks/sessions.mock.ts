import type { Session } from '../types'

export const mock_sessions: Session[] = [
  {
    id: '1',
    title: 'Dilema do Prisioneiro',
    subtitle: 'Laboratório de Psicologia',
    description: 'Experimento de análise comportamental com 20 duplas, durante 10 rodadas.',
    room: 'Sala 102',
    date: '2025.1',
    team: 'Turma A',
    category: 'Gênero, Idade',
    status: 'active'
  },
  {
    id: '2',
    title: 'Jogo da equivalência',
    subtitle: 'Sala 102',
    description: 'Experimento de equivalência de estímulos e relações condicionais.',
    room: 'Sala 102',
    date: '2025.1',
    team: 'Turma B',
    category: 'Gênero, Idade',
    status: 'active'
  },
  {
    id: '3',
    title: 'Terceiro jogo',
    subtitle: 'Sala 103',
    description: 'Experimento de análise comportamental aplicada.',
    room: 'Sala 103',
    date: '2025.1',
    team: 'Turma C',
    category: 'Anônima',
    status: 'active'
  },
  {
    id: '4',
    title: 'Estudo de Cooperação',
    subtitle: 'Laboratório de Comportamento',
    description: 'Análise de comportamento cooperativo em grupos de 4 pessoas durante 8 rodadas.',
    room: 'Sala 201',
    date: '2025.2',
    team: 'Turma D',
    category: 'Gênero, Idade',
    status: 'upcoming'
  },
  {
    id: '5',
    title: 'Tomada de Decisão',
    subtitle: 'Sala 105',
    description: 'Experimento sobre processos de tomada de decisão sob incerteza.',
    room: 'Sala 105',
    date: '2025.2',
    team: 'Turma E',
    category: 'Anônima',
    status: 'upcoming'
  }
]

export const mock_validate_code_response = {
  valid: true,
  requirements: [
    {
      field: 'name',
      label: 'Nome completo',
      type: 'text' as const,
      required: true,
      placeholder: 'Digite seu nome'
    },
    {
      field: 'email',
      label: 'E-mail',
      type: 'email' as const,
      required: true,
      placeholder: 'seu.email@exemplo.com'
    },
    {
      field: 'age',
      label: 'Idade',
      type: 'number' as const,
      required: false,
      placeholder: '18'
    }
  ]
}
