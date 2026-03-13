import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '../../game/games.enum';

/**
 * DTO for session configurations
 * Can be extended with game-specific fields
 */
export class SessionSettingsDto {
  @ApiProperty({
    example: 'Card Game Configuration',
    description: 'Configuration name',
  })
  @IsNotEmpty()
  @IsString()
  configName: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether the player can view points',
  })
  @IsOptional()
  @IsBoolean()
  userViewPoints?: boolean;

  @ApiProperty({
    example: 10,
    required: false,
    description: 'Session round limit',
  })
  @IsOptional()
  @IsNumber()
  limitRounds?: number;

  // Game-specific fields for Cards (optional)
  @ApiProperty({
    example: 52,
    required: false,
    description: 'Deck size (Cards)',
  })
  @IsOptional()
  @IsNumber()
  cardDeckSize?: number;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Allow special cards (Cards)',
  })
  @IsOptional()
  @IsBoolean()
  allowSpecialCards?: boolean;

  @ApiProperty({
    example: 'standard',
    required: false,
    description: 'Deck theme (Cards)',
  })
  @IsOptional()
  @IsString()
  cardTheme?: string;

  // Game-specific fields for Words (optional)
  @ApiProperty({
    example: 100,
    required: false,
    description: 'Word pool size (Words)',
  })
  @IsOptional()
  @IsNumber()
  wordPoolSize?: number;

  @ApiProperty({
    example: 'medium',
    required: false,
    enum: ['easy', 'medium', 'hard'],
    description: 'Difficulty level (Words)',
  })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Include timer per word (Words)',
  })
  @IsOptional()
  @IsBoolean()
  includeTimerPerWord?: boolean;

  @ApiProperty({
    example: 30,
    required: false,
    description: 'Seconds per word (Words)',
  })
  @IsOptional()
  @IsNumber()
  secondsPerWord?: number;
}
