import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

// class-validator's @IsOptional() only skips validation for undefined/null —
// an empty string from a "no selection" dropdown still fails @IsMongoId().
// This coerces "" to undefined before validation runs, for any optional
// ObjectId-style field populated from a select input.
const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['admin', 'coordinator', 'participant', 'partner', 'parent'])
  role!: 'admin' | 'coordinator' | 'participant' | 'partner' | 'parent';

  // --- participant-only fields (CR-02) ---
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(11)
  @Max(18)
  age?: number;

  @IsOptional()
  @IsString()
  contactDetails?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsBoolean()
  digitalConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  publicShowcaseConsent?: boolean;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsMongoId()
  cohortId?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsMongoId()
  partnerOrgId?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsMongoId()
  parentId?: string;

  // --- partner-only fields ---
  @IsOptional()
  @IsString()
  venueType?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  // --- parent-only fields ---
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  participantIds?: string[];
}
