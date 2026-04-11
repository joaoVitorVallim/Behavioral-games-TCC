import { IsUUID, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitChoiceDto {
  @ApiProperty({ example: 'uuid-da-match', description: 'ID da partida' })
  @IsUUID()
  matchId: string;

  @ApiProperty({ example: 'uuid-do-player', description: 'ID do jogador' })
  @IsUUID()
  playerId: string;

  @ApiProperty({ example: 'cooperate', enum: ['cooperate', 'defect'] })
  @IsIn(['cooperate', 'defect'])
  choice: 'cooperate' | 'defect';
}
