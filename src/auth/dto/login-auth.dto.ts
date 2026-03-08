import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'joao.silva',
    description: 'Username',
  })
  @IsString()
  login: string;

  @ApiProperty({
    example: 'senha123',
    description: 'User password',
  })
  @IsString()
  password: string;
}
