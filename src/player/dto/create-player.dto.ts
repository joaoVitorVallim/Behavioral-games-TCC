import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({
    example: 'João P.',
    description: 'Player nickname or name',
    required: false,
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({
    example: 'Software Engineering',
    description: "Player's course",
    required: false,
  })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiProperty({
    example: 22,
    description: "Player's age",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({
    example: 'Male',
    description: "Player's gender",
    required: false,
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    example: 'Student',
    description: "Player's profession or occupation",
    required: false,
  })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiProperty({
    example: 'd7fb8887-9739-4aab-8934-df34707d8d98',
    description: 'Session ID the player belongs to',
  })
  @IsUUID()
  session_id: string;
}
