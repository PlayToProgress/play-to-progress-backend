import { IsIn, IsMongoId } from 'class-validator';
import { RECOGNITION_BADGE_TYPES } from '../recognition-badges';
import type { BadgeType } from '../../schemas/badge.schema';

export class AwardBadgeDto {
  @IsMongoId()
  participantId!: string;

  @IsIn(RECOGNITION_BADGE_TYPES)
  type!: BadgeType;
}