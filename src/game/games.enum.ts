export enum GameType {
  CARDS = 'cards',
  WORDS = 'words',
}

export interface GameConfig {
  name: string;
  description: string;
  redirectUrl: string;
}

export const GAMES_CONFIG: Record<GameType, GameConfig> = {
  [GameType.CARDS]: {
    name: 'Card Game',
    description: 'A strategic and educational card game',
    redirectUrl: 'https://cards-game.example.com',
  },
  [GameType.WORDS]: {
    name: 'Word Game',
    description: 'A word game for vocabulary development',
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
