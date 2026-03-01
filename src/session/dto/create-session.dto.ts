import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsUUID()
  jogo_id: string;

  @IsNotEmpty()
  @IsUUID()
  settings_id: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
