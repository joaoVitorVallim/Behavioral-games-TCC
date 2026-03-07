import { Injectable } from '@nestjs/common';
import { GameType, getAllGames, getGameInfo, getGameRedirectUrl } from './games.enum';

@Injectable()
export class GameService {

  findAll() {
    return getAllGames();
  }


  findOne(gameType: GameType) {
    const gameInfo = getGameInfo(gameType);
    if (!gameInfo) {
      return null;
    }
    return {
      id: gameType,
      ...gameInfo,
    };
  }

  
  isValidGameType(gameType: string): gameType is GameType {
    return Object.values(GameType).includes(gameType as GameType);
  }


  getRedirectUrl(gameType: GameType, sessionCode: string): string {
    return getGameRedirectUrl(gameType, sessionCode);
  }
}
