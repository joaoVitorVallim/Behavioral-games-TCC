import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlayerReadyDto {
  @ApiProperty({ example: 'uuid-da-match', description: 'ID da partida' })
  @IsUUID()
  matchId: string;

  @ApiProperty({ example: 'uuid-do-player', description: 'ID do jogador que clicou em Iniciar na tela de instruções' })
  @IsUUID()
  playerId: string;
}
