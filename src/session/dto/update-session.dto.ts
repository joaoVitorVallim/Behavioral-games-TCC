import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSessionDto {
  @ApiPropertyOptional({
    example: false,
    description: 'Session status (active/inactive)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
