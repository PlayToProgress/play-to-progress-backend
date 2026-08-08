import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  description!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsBoolean()
  submit?: boolean;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  submit?: boolean;

  @IsOptional()
  @IsIn(['approve', 'reject'])
  decision?: 'approve' | 'reject';
}
