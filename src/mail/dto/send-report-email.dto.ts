import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsEmail, IsOptional } from 'class-validator';

export class SendReportEmailDto {
  @ApiPropertyOptional({
    type: [String],
    example: ['aluno@exemplo.com'],
    description:
      'Emails to send the report to. Not stored anywhere on the server.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsEmail({}, { each: true })
  emails?: string[];
}
