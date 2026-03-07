import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDto {
  @ApiProperty({
    example: false,
    required: false,
    description: 'Status da sessão (ativa/inativa)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
