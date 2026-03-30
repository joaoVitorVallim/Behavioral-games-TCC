import { IsNotEmpty, IsEnum, ValidateNested, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameType } from '../../game/games.enum';
import { SessionSettingsDto } from './session-settings.dto';
import { IsValidInputInfos } from '../../common/validators/valid-input-infos.validator';
import { PLAYER_OPTIONAL_FIELDS } from '../../common/constants/player-fields.constants';

export class CreateSessionDto {
  @ApiProperty({
    enum: GameType,
    example: 'cards',
    description: 'Game type (cards or roulette)',
  })
  @IsNotEmpty()
  @IsEnum(GameType)
  game: GameType;

  @ApiProperty({
    description: 'Session configurations',
    type: SessionSettingsDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SessionSettingsDto)
  settings: SessionSettingsDto;

  @ApiPropertyOptional({
    example: ['educationLevel', 'semester', 'profession'],
    isArray: true,
    description: `Information that the player must provide. Valid fields: ${PLAYER_OPTIONAL_FIELDS.join(', ')}`,
    enum: PLAYER_OPTIONAL_FIELDS,
  })
  @IsOptional()
  @IsArray()
  @IsValidInputInfos()
  inputInfo?: string[];

  @ApiProperty({
    example: 'ab5d10f7-8522-498c-a585-97cdc9d0956d',
    description: 'ID of the user/teacher creating the session',
  })
  @IsNotEmpty()
  user_id: string;
}
