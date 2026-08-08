import {
  IsIn,
  IsISO8601,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class MarkAttendanceDto {
  @IsMongoId()
  cohortId!: string;

  @IsMongoId()
  participantId!: string;

  @IsInt()
  @Min(1)
  sessionNumber!: number;

  @IsISO8601()
  date!: string;

  @IsIn(['present', 'absent', 'late'])
  status!: 'present' | 'absent' | 'late';

  @IsOptional()
  @IsString()
  notes?: string;
}
