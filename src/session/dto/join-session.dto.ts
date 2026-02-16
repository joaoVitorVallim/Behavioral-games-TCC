import { IsString, IsInt, Min, MaxLength } from 'class-validator';

export class JoinSessionDto {
  @IsString()
  @MaxLength(100)
  nickname: string;

  @IsString()
  @MaxLength(100)
  course: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsString()
  @MaxLength(50)
  gender: string;

  @IsString()
  @MaxLength(100)
  profession: string;
}
