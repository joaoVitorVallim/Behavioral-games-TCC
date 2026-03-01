import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsUUID } from 'class-validator';

export class CreateSettingsDto {
  @IsNotEmpty()
  @IsString()
  configName: string;

  @IsNotEmpty()
  @IsUUID()
  game_id: string;

  @IsOptional()
  @IsArray()
  inputInfos?: string[];

  @IsOptional()
  @IsBoolean()
  userViewPoints?: boolean;

  @IsOptional()
  @IsNumber()
  limitRounds?: number;

  // Game-specific fields (optional)
  @IsOptional()
  @IsNumber()
  cardDeckSize?: number;

  @IsOptional()
  @IsBoolean()
  allowSpecialCards?: boolean;

  @IsOptional()
  @IsString()
  cardTheme?: string;

  @IsOptional()
  @IsNumber()
  wordPoolSize?: number;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsBoolean()
  includeTimerPerWord?: boolean;

  @IsOptional()
  @IsNumber()
  secondsPerWord?: number;
}
