import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CardsMoveOption,
  MatchStatus,
  RouletteMoveOption,
} from '../match.entity';
import type { MatchMoves } from '../match.entity';
import { IsMovesByRound } from '../validators/moves-by-round.validator';

export class CreateMatchDto {
  @ApiProperty({
    example: 'd7fb8887-9739-4aab-8934-df34707d8d98',
    description: 'Session ID',
  })
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    example: 'e7fb8887-9739-4aab-8934-df34707d8d98',
    description: 'Player 1 ID',
  })
  @IsNotEmpty()
  player1Id: string;

  @ApiPropertyOptional({
    example: 'f7fb8887-9739-4aab-8934-df34707d8d98',
    description: 'Player 2 ID',
  })
  @IsOptional()
  @IsNotEmpty()
  player2Id?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Moves grouped by round keys ("1", "2", ...)',
    example: {
      '1': {
        jogador1: CardsMoveOption.VERMELHO,
        jogador2: CardsMoveOption.PRETO,
      },
      '2': {
        coinsAmount: 900,
        aposta: 100,
        opcao: RouletteMoveOption.AZUL,
        winrate: true,
      },
    },
  })
  @IsOptional()
  @IsObject()
  @IsMovesByRound()
  moves?: MatchMoves;

  @ApiPropertyOptional({
    example: 180,
    description: 'Match time in seconds',
  })
  @IsOptional()
  @IsInt()
  matchTime?: number;

  @ApiPropertyOptional({
    enum: MatchStatus,
    example: MatchStatus.AGUARDANDO,
    description: 'Match status',
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}
