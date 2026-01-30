import { IsNotEmpty, IsUUID, IsNumber } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsUUID()
  game_id: string;

  @IsNotEmpty()
  @IsUUID()
  settings_id: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsNumber()
  roundsLimit: number;
}

