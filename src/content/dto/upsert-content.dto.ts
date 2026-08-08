import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class MaterialDto {
  @IsIn(['pdf', 'video', 'link', 'image'])
  type!: 'pdf' | 'video' | 'link' | 'image';

  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  url!: string;
}

export class UpsertContentDto {
  @IsMongoId()
  cohortId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  weekNumber!: number;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialDto)
  materials?: MaterialDto[];

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
