import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SurveyQuestionDto {
  @IsString()
  id!: string;

  @IsString()
  @MinLength(2)
  text!: string;

  @IsIn(['text', 'rating', 'multiple_choice'])
  type!: 'text' | 'rating' | 'multiple_choice';

  @IsOptional()
  @IsArray()
  options?: string[];
}

export class CreateSurveyDto {
  @IsMongoId()
  cohortId!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDto)
  questions!: SurveyQuestionDto[];

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['participant', 'parent', 'partner'], { each: true })
  targetAudience!: ('participant' | 'parent' | 'partner')[];

  @IsOptional()
  published?: boolean;
}

export class SurveyAnswerDto {
  @IsString()
  questionId!: string;

  @IsString()
  value!: string;
}

export class SubmitResponseDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerDto)
  answers!: SurveyAnswerDto[];
}
