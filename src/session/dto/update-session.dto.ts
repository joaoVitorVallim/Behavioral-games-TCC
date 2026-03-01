import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateSessionDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
