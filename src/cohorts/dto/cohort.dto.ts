import {
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCohortDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsISO8601()
  startDate!: string;

  @IsISO8601()
  endDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(52)
  numSessions?: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  partnerOrgIds?: string[];

  @IsOptional()
  @IsIn(['planned', 'active', 'completed'])
  status?: 'planned' | 'active' | 'completed';
}

export class UpdateCohortDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(52)
  numSessions?: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  partnerOrgIds?: string[];

  @IsOptional()
  @IsIn(['planned', 'active', 'completed'])
  status?: 'planned' | 'active' | 'completed';
}
