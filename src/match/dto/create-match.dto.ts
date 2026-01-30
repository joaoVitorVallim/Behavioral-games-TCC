import { IsNotEmpty, IsUUID, IsOptional, IsEnum, IsObject } from 'class-validator';
import { MatchStatus } from '../match.entity';

export class CreateMatchDto {
  @IsNotEmpty()
  @IsUUID()
  session_id: string;

  @IsNotEmpty()
  @IsUUID()
  player1_id: string;

  @IsNotEmpty()
  @IsUUID()
  player2_id: string;

  @IsOptional()
  @IsObject()
  moves?: Record<string, any>;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}
