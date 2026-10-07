import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsInt,
  Max,
  MaxLength,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EducationLevel } from '../education-level.enum';

export class CreatePlayerDto {
  @ApiPropertyOptional({
    example: '12345678',
    description: "Player's RA (academic registration number)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  ra?: string;

  @ApiPropertyOptional({
    example: 'aluno@email.com',
    description: "Analyst/student e-mail typed at entry",
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    enum: EducationLevel,
    example: EducationLevel.BACHELOR,
    description: "Player's education level",
  })
  @IsOptional()
  @IsEnum(EducationLevel)
  educationLevel?: EducationLevel;

  @ApiPropertyOptional({
    example: 6,
    description: "Player's current semester (max 16)",
  })
  @IsOptional()
  @IsInt()
  @Max(16)
  semester?: number;

  @ApiPropertyOptional({
    example: 'Software Engineering',
    description: "Player's course",
  })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiPropertyOptional({
    example: 22,
    description: "Player's age",
  })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({
    example: 'Male',
    description: "Player's gender",
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    example: 'Student',
    description: "Player's profession or occupation",
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
