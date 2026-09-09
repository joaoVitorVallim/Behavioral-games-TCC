import { IsUUID, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RouletteMoveOption } from '../../match/match.entity';

export class SpinRouletteDto {
  @ApiProperty({ example: 'uuid-do-player', description: 'ID do jogador' })
  @IsUUID()
  playerId: string;

  @ApiProperty({ enum: RouletteMoveOption, example: RouletteMoveOption.VERMELHO })
  @IsEnum(RouletteMoveOption)
  opcao: RouletteMoveOption;

  @ApiProperty({ example: 100, description: 'Valor apostado' })
  @IsInt()
  @Min(1)
  aposta: number;
}
