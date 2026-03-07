import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GameType } from '../../game/games.enum';

export class CreateSettingsDto {
  @ApiProperty({
    example: 'Configuração Jogo de Cartas Nível 1',
    description: 'Nome descritivo da configuração',
  })
  @IsNotEmpty()
  @IsString()
  configName: string;

  @ApiProperty({
    enum: GameType,
    example: 'cards',
    description: 'Tipo de jogo (cards ou words)',
  })
  @IsNotEmpty()
  @IsEnum(GameType)
  jogo: GameType;

  @ApiProperty({
    example: ['nome', 'profissao'],
    description: 'Informações que o jogador deve informar',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  inputInfos?: string[];

  @ApiProperty({
    example: true,
    description: 'Se o jogador pode visualizar pontos',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  userViewPoints?: boolean;

  @ApiProperty({
    example: 10,
    description: 'Limite de rodadas da sessão',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  limitRounds?: number;

  @ApiProperty({
    example: 52,
    description: 'Tamanho do baralho (apenas para Cards)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cardDeckSize?: number;

  @ApiProperty({
    example: true,
    description: 'Permite cartas especiais (apenas para Cards)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowSpecialCards?: boolean;

  @ApiProperty({
    example: 'standard',
    description: 'Tema do baralho (apenas para Cards)',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardTheme?: string;

  @ApiProperty({
    example: 100,
    description: 'Tamanho do pool de palavras (apenas para Words)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  wordPoolSize?: number;

  @ApiProperty({
    enum: ['easy', 'medium', 'hard'],
    example: 'medium',
    description: 'Nível de dificuldade (apenas para Words)',
    required: false,
  })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty({
    example: false,
    description: 'Inclui timer por palavra (apenas para Words)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeTimerPerWord?: boolean;

  @ApiProperty({
    example: 30,
    description: 'Segundos por palavra (apenas para Words)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  secondsPerWord?: number;
}
