import type { Session, ValidateCodeResponse } from '../types'

export const mock_sessions: Session[] = [
  {
    id: '1',
    session_name: 'Dilema do Prisioneiro — Turma A',
    game: 'cards',
    inputInfo: ['nickname', 'age', 'gender'],
    settings: {
      id: 'cfg-1',
      configName: 'Configuração Padrão Cards',
      game: 'cards',
      userViewPoints: true,
      limitRounds: 10,
      createdAt: '2025-03-01T10:00:00Z',
      cardDeckSize: 52,
      allowSpecialCards: true,
      cardTheme: 'standard',
      wordPoolSize: 100,
      difficulty: 'medium',
      includeTimerPerWord: false,
      secondsPerWord: 30
    },
    settings_id: 'cfg-1',
    inviteCode: 'ABC123',
    user: { id: 'u1', name: 'Prof. Silva', login: 'silva@fho.edu.br' },
    user_id: 'u1',
    players: ['player-1', 'player-2'],
    isActive: true,
    created_at: '2025-03-01T10:00:00Z',
    finished_at: null
  },
  {
    id: '2',
    session_name: 'Jogo da Equivalência — Turma B',
    game: 'words',
    inputInfo: ['nickname', 'email'],
    settings: {
      id: 'cfg-2',
      configName: 'Configuração Padrão Words',
      game: 'words',
      userViewPoints: true,
      limitRounds: 15,
      createdAt: '2025-03-05T14:00:00Z',
      cardDeckSize: 52,
      allowSpecialCards: false,
      cardTheme: 'standard',
      wordPoolSize: 200,
      difficulty: 'easy',
      includeTimerPerWord: true,
      secondsPerWord: 20
    },
    settings_id: 'cfg-2',
    inviteCode: 'XYZ789',
    user: { id: 'u1', name: 'Prof. Silva', login: 'silva@fho.edu.br' },
    user_id: 'u1',
    players: [],
    isActive: true,
    created_at: '2025-03-05T14:00:00Z',
    finished_at: null
  },
  {
    id: '3',
    session_name: 'Estudo de Cooperação — Turma C',
    game: 'cards',
    inputInfo: ['name', 'age', 'profession'],
    settings: {
      id: 'cfg-3',
      configName: 'Cards Difícil',
      game: 'cards',
      userViewPoints: false,
      limitRounds: 20,
      createdAt: '2025-03-10T09:00:00Z',
      cardDeckSize: 104,
      allowSpecialCards: true,
      cardTheme: 'modern',
      wordPoolSize: 100,
      difficulty: 'hard',
      includeTimerPerWord: false,
      secondsPerWord: 30
    },
    settings_id: 'cfg-3',
    inviteCode: 'QWE456',
    user: { id: 'u2', name: 'Prof. Costa', login: 'costa@fho.edu.br' },
    user_id: 'u2',
    players: ['player-3', 'player-4', 'player-5'],
    isActive: false,
    created_at: '2025-03-10T09:00:00Z',
    finished_at: '2025-03-10T11:30:00Z'
  }
]

export const mock_validate_code_response: ValidateCodeResponse = {
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
