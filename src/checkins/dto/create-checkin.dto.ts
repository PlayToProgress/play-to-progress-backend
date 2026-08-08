import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCheckInDto {
  @IsInt()
  @Min(1)
  sessionNumber!: number;

  @IsIn(['start', 'end'])
  stage!: 'start' | 'end';

  @IsInt()
  @Min(1)
  @Max(5)
  mood!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
