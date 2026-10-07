import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength } from 'class-validator';
import { EducationLevel } from '../../player/education-level.enum';

export class JoinSessionDto {
  @ApiProperty({
    example: 'F4LVTX',
    description: 'Session invite code',
  })
  @IsString()
  inviteCode: string;

  @ApiProperty({
    example: '12345678',
    description: "Player's RA (academic registration number)",
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Informe o RA.' })
  @Matches(/^[A-Za-z0-9.-]+$/, { message: 'O RA deve ter apenas letras e números.' })
  @MaxLength(30)
  ra: string;

  @ApiPropertyOptional({
    example: 'aluno@email.com',
    description: "Analyst/student e-mail typed at entry (where the match report is sent)",
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
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
    example: 'M',
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
}
