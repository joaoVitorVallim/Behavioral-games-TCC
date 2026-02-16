import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreatePlayerDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsUUID()
  session_id: string;
}
