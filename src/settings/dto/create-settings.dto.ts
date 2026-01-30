import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class CreateSettingsDto {
  @IsNotEmpty()
  @IsString()
  configName: string;

  @IsNotEmpty()
  @IsObject()
  parameters: Record<string, any>;
}
