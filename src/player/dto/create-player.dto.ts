import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreatePlayerDto {
  @IsOptional()
  @IsString()
  apelido?: string;

  @IsOptional()
  @IsString()
  curso?: string;

  @IsOptional()
  @IsNumber()
  idade?: number;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsString()
  profissao?: string;

  @IsUUID()
  session_id: string;
}
