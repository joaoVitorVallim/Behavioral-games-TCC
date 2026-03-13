import { IsInt, IsObject, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveDto {
  @ApiProperty({
    example: 1,
    description: 'Player number (1 or 2)',
  })
  @IsInt()
  @Min(1)
  @Max(2)
  player: number;

  @ApiProperty({
    example: { action: 'pick_card', cardId: '7h' },
    description: 'Game-specific action payload',
  })
  @IsObject()
  action: Record<string, any>;

  @ApiProperty({
    example: '2026-03-12T12:34:56.000Z',
    description: 'Timestamp of the move',
  })
  @IsDateString()
  timestamp: string;
}
