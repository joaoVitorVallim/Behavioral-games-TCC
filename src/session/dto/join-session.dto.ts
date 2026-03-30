import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { EducationLevel } from '../../player/education-level.enum';

export class JoinSessionDto {
  @ApiProperty({
    example: 'F4LVTX',
    description: 'Session invite code',
  })
  @IsString()
  inviteCode: string;

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
