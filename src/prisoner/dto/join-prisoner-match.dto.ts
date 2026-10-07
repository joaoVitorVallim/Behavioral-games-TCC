import { IsUUID, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JoinPrisonerMatchDto {
  @ApiProperty({ example: 'uuid-da-match', description: 'ID da partida a entrar' })
  @IsUUID()
  matchId: string;

  @ApiProperty({ example: 'uuid-do-player', description: 'ID do jogador' })
  @IsUUID()
  playerId: string;

  @ApiPropertyOptional({
    example: 'aluno@exemplo.com',
    description: 'E-mail para receber o relatório da partida quando ela terminar.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
