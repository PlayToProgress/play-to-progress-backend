import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

export class UpdateParticipantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  digitalConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  publicShowcaseConsent?: boolean;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsMongoId()
  partnerOrgId?: string;
}
