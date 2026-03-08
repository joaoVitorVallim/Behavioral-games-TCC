import { IsNotEmpty, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '../../game/games.enum';
import { SessionSettingsDto } from './session-settings.dto';

export class CreateSessionDto {
  @ApiProperty({
    enum: GameType,
    example: 'cards',
    description: 'Game type (cards or words)',
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

  @ApiProperty({
    example: 'ab5d10f7-8522-498c-a585-97cdc9d0956d',
    description: 'ID of the user/teacher creating the session',
  })
  @IsNotEmpty()
  user_id: string;
}
