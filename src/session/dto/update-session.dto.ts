import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDto {
  @ApiProperty({
    example: false,
    required: false,
    description: 'Session status (active/inactive)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
