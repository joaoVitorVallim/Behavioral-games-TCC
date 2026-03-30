import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameType } from '../../game/games.enum';
import { Type } from 'class-transformer';

class RoulettePopupDto {
  @ApiProperty({
    example: 'Mensagem do popup aparecer na tela',
    description: 'Popup message shown to selected players',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    example: 2,
    description: 'Number of players that should receive this popup',
  })
  @IsNumber()
  players: number;
}

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
    description: 'Game type (cards or roulette)',
  })
  @IsNotEmpty()
  @IsEnum(GameType)
  game: GameType;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the player can view points (Cards only)',
  })
  @IsOptional()
  @IsBoolean()
  userViewPoints?: boolean;

  @ApiPropertyOptional({
    example: 10,
    description: 'Session round limit (Cards only)',
  })
  @IsOptional()
  @IsNumber()
  limitRounds?: number;

  @ApiPropertyOptional({
    example: 60,
    description: 'Time limit in seconds (Roulette only)',
  })
  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Points limit (Roulette only)',
  })
  @IsOptional()
  @IsNumber()
  pointsLimit?: number;

  @ApiPropertyOptional({
    nullable: true,
    type: RoulettePopupDto,
    example: { message: 'Mensagem do popup aparecer na tela', players: 2 },
    description: 'Optional popup config, nullable (Roulette only)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RoulettePopupDto)
  popup?: RoulettePopupDto | null;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Initial money amount for players (Roulette only)',
  })
  @IsOptional()
  @IsNumber()
  initMoney?: number;
}
