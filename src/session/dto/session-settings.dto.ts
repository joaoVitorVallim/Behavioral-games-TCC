import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '../../game/games.enum';

/**
 * DTO para as configurações da sessão
 * Pode ser estendido com campos específicos de cada jogo
 */
export class SessionSettingsDto {
  @ApiProperty({
    example: 'Config Jogo de Cartas',
    description: 'Nome da configuração',
  })
  @IsNotEmpty()
  @IsString()
  configName: string;

  @ApiProperty({
    example: ['nome', 'profissao'],
    isArray: true,
    required: false,
    description: 'Informações que o jogador deve informar',
  })
  @IsOptional()
  @IsArray()
  inputInfos?: string[];

  @ApiProperty({
    example: true,
    required: false,
    description: 'Se o jogador pode visualizar pontos',
  })
  @IsOptional()
  @IsBoolean()
  userViewPoints?: boolean;

  @ApiProperty({
    example: 10,
    required: false,
    description: 'Limite de rodadas da sessão',
  })
  @IsOptional()
  @IsNumber()
  limitRounds?: number;

  // Game-specific fields for Cards (optional)
  @ApiProperty({
    example: 52,
    required: false,
    description: 'Tamanho do baralho (Cards)',
  })
  @IsOptional()
  @IsNumber()
  cardDeckSize?: number;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Permite cartas especiais (Cards)',
  })
  @IsOptional()
  @IsBoolean()
  allowSpecialCards?: boolean;

  @ApiProperty({
    example: 'standard',
    required: false,
    description: 'Tema do baralho (Cards)',
  })
  @IsOptional()
  @IsString()
  cardTheme?: string;

  // Game-specific fields for Words (optional)
  @ApiProperty({
    example: 100,
    required: false,
    description: 'Tamanho do pool de palavras (Words)',
  })
  @IsOptional()
  @IsNumber()
  wordPoolSize?: number;

  @ApiProperty({
    example: 'medium',
    required: false,
    enum: ['easy', 'medium', 'hard'],
    description: 'Nível de dificuldade (Words)',
  })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Inclui timer por palavra (Words)',
  })
  @IsOptional()
  @IsBoolean()
  includeTimerPerWord?: boolean;

  @ApiProperty({
    example: 30,
    required: false,
    description: 'Segundos por palavra (Words)',
  })
  @IsOptional()
  @IsNumber()
  secondsPerWord?: number;
}
