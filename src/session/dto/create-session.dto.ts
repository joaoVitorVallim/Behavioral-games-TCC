import { IsNotEmpty, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '../../game/games.enum';
import { SessionSettingsDto } from './session-settings.dto';

export class CreateSessionDto {
  @ApiProperty({
    enum: GameType,
    example: 'cards',
    description: 'Tipo de jogo (cards ou words)',
  })
  @IsNotEmpty()
  @IsEnum(GameType)
  jogo: GameType;

  @ApiProperty({
    description: 'Configurações da sessão',
    type: SessionSettingsDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SessionSettingsDto)
  settings: SessionSettingsDto;

  @ApiProperty({
    example: 'ab5d10f7-8522-498c-a585-97cdc9d0956d',
    description: 'ID do usuário/professor criador da sessão',
  })
  @IsNotEmpty()
  user_id: string;
}
