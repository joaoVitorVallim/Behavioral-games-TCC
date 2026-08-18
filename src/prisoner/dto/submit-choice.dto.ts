import { IsUUID, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({
    example: 3,
    description:
      'Rodada a que a escolha se refere. Se enviada e não corresponder à rodada atual, a jogada é rejeitada (evita que um clique atrasado conte para a rodada seguinte).',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  round?: number;
}
