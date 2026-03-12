import type { GameConfig, CreateConfigPayload } from '../types'

export const MOCK_CONFIGS: GameConfig[] = [
  {
    id: 'cfg-1',
    configName: 'Configuração Padrão Cards',
    game: 'cards',
    userViewPoints: true,
    limitRounds: 10,
    cardDeckSize: 52,
    allowSpecialCards: true,
    cardTheme: 'standard',
    wordPoolSize: 100,
    difficulty: 'medium',
    includeTimerPerWord: false,
    secondsPerWord: 30
  },
  {
    id: 'cfg-2',
    configName: 'Cards Difícil',
    game: 'cards',
    userViewPoints: false,
    limitRounds: 20,
    cardDeckSize: 104,
    allowSpecialCards: true,
    cardTheme: 'modern',
    wordPoolSize: 100,
    difficulty: 'hard',
    includeTimerPerWord: false,
    secondsPerWord: 30
  },
  {
    id: 'cfg-3',
    configName: 'Configuração Padrão Words',
    game: 'words',
    userViewPoints: true,
    limitRounds: 15,
    cardDeckSize: 52,
    allowSpecialCards: false,
    cardTheme: 'standard',
    wordPoolSize: 200,
    difficulty: 'easy',
    includeTimerPerWord: true,
    secondsPerWord: 20
  }
]

export function generateMockCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random_values = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(random_values, (v) => chars[v % chars.length]).join('')
}

export function buildDefaultConfig(game: string): CreateConfigPayload {
  return {
    configName: '',
    game,
    userViewPoints: true,
    limitRounds: 10,
    cardDeckSize: 52,
    allowSpecialCards: true,
    cardTheme: 'standard',
    wordPoolSize: 100,
    difficulty: 'medium',
    includeTimerPerWord: false,
    secondsPerWord: 30
  }
}
