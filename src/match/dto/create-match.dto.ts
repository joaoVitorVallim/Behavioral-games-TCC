import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus } from '../match.entity';
import { MoveDto } from './move.dto';

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

  @ApiProperty({
    example: 'f7fb8887-9739-4aab-8934-df34707d8d98',
    description: 'Player 2 ID',
  })
  @IsNotEmpty()
  player2Id: string;

  @ApiProperty({
    type: MoveDto,
    isArray: true,
    required: false,
    description: 'Moves list',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MoveDto)
  moves?: MoveDto[];

  @ApiProperty({
    example: 180,
    required: false,
    description: 'Match time in seconds',
  })
  @IsOptional()
  @IsInt()
  matchTime?: number;

  @ApiProperty({
    enum: MatchStatus,
    example: MatchStatus.AGUARDANDO,
    required: false,
    description: 'Match status',
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}
