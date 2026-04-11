import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinPrisonerMatchDto {
  @ApiProperty({ example: 'uuid-da-match', description: 'ID da partida a entrar' })
  @IsUUID()
  matchId: string;

  @ApiProperty({ example: 'uuid-do-player', description: 'ID do jogador' })
  @IsUUID()
  playerId: string;
}
