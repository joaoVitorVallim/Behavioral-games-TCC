export enum GameType {
  CARDS = 'cards',
  WORDS = 'words',
}

export interface GameConfig {
  nome: string;
  descricao: string;
  redirectUrl: string;
}

export const GAMES_CONFIG: Record<GameType, GameConfig> = {
  [GameType.CARDS]: {
    nome: 'Jogo de Cartas',
    descricao: 'Um jogo de cartas estratégico e educativo',
    redirectUrl: 'https://cards-game.example.com',
  },
  [GameType.WORDS]: {
    nome: 'Jogo de Palavras',
    descricao: 'Um jogo de palavras para desenvolvimento de vocabulário',
    redirectUrl: 'https://words-game.example.com',
  },
};


export function getGameRedirectUrl(gameType: GameType, sessionCode: string): string {
  const baseUrl = GAMES_CONFIG[gameType].redirectUrl;
  return `${baseUrl}?session=${sessionCode}`;
}


export function getAllGames() {
  return Object.entries(GAMES_CONFIG).map(([key, config]) => ({
    id: key,
    ...config,
  }));
}


export function getGameInfo(gameType: GameType) {
  return GAMES_CONFIG[gameType] || null;
}
