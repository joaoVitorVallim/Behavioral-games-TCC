import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '../../game/games.enum';
import { IsValidInputInfos } from '../../common/validators/valid-input-infos.validator';
import { PLAYER_OPTIONAL_FIELDS, PLAYER_OPTIONAL_FIELDS_LABELS } from '../../common/constants/player-fields.constants';

export class CreateSettingsDto {
  @ApiProperty({
    example: 'Card Game Level 1 Configuration',
    description: 'Descriptive name of the configuration',
  })
  @IsNotEmpty()
  @IsString()
  configName: string;

  @ApiProperty({
    enum: GameType,
    example: 'cards',
    description: 'Game type (cards or words)',
  })
  @IsNotEmpty()
  @IsEnum(GameType)
  game: GameType;

  @ApiProperty({
    example: ['nickname', 'profession'],
    description: `Optional player fields that must be filled. Valid fields: ${PLAYER_OPTIONAL_FIELDS.join(', ')}`,
    enum: PLAYER_OPTIONAL_FIELDS,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsValidInputInfos()
  inputInfo?: string[];

  @ApiProperty({
    example: true,
    description: 'Whether the player can view points',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  userViewPoints?: boolean;

  @ApiProperty({
    example: 10,
    description: 'Session round limit',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  limitRounds?: number;

  @ApiProperty({
    example: 52,
    description: 'Deck size (Cards only)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cardDeckSize?: number;

  @ApiProperty({
    example: true,
    description: 'Allow special cards (Cards only)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowSpecialCards?: boolean;

  @ApiProperty({
    example: 'standard',
    description: 'Deck theme (Cards only)',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardTheme?: string;

  @ApiProperty({
    example: 100,
    description: 'Word pool size (Words only)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  wordPoolSize?: number;

  @ApiProperty({
    enum: ['easy', 'medium', 'hard'],
    example: 'medium',
    description: 'Difficulty level (Words only)',
    required: false,
  })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty({
    example: false,
    description: 'Include timer per word (Words only)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeTimerPerWord?: boolean;

  @ApiProperty({
    example: 30,
    description: 'Seconds per word (Words only)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  secondsPerWord?: number;
}
