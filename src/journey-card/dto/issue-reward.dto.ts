import { IsMongoId } from 'class-validator';

export class IssueRewardDto {
  @IsMongoId()
  participantId!: string;
}
