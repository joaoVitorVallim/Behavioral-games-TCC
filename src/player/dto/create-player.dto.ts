import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({
    example: 'João P.',
    description: 'Apelido ou nome do jogador',
    required: false,
  })
  @IsOptional()
  @IsString()
  apelido?: string;

  @ApiProperty({
    example: 'Engenharia de Software',
    description: 'Curso do jogador',
    required: false,
  })
  @IsOptional()
  @IsString()
  curso?: string;

  @ApiProperty({
    example: 22,
    description: 'Idade do jogador',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  idade?: number;

  @ApiProperty({
    example: 'Masculino',
    description: 'Gênero do jogador',
    required: false,
  })
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiProperty({
    example: 'Estudante',
    description: 'Profissão ou ocupação do jogador',
    required: false,
  })
  @IsOptional()
  @IsString()
  profissao?: string;

  @ApiProperty({
    example: 'd7fb8887-9739-4aab-8934-df34707d8d98',
    description: 'ID da sessão à qual o jogador pertence',
  })
  @IsUUID()
  session_id: string;
}
