import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus } from '../match.entity';

export class UpdateMatchStatusDto {
  @ApiProperty({
    enum: MatchStatus,
    example: MatchStatus.EM_PARTIDA,
    description: 'Match status',
  })
  @IsEnum(MatchStatus)
  status: MatchStatus;
}
