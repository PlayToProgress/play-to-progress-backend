import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class Stamp {
  @Prop({ type: Number, required: true })
  sessionNumber!: number;

  @Prop({ type: Date, required: true })
  earnedAt!: Date;
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class JourneyCard extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Participant',
    required: true,
    unique: true,
  })
  participantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cohort', required: true })
  cohortId!: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  stamps!: Stamp[];

  @Prop({ type: Number, default: 0 })
  stampCount!: number;

  @Prop({ type: Boolean, default: false })
  rewardUnlocked!: boolean;

  @Prop({ type: Date })
  rewardUnlockedAt?: Date;

  @Prop({ type: Boolean, default: false })
  rewardIssued!: boolean;

  @Prop({ type: Date })
  rewardIssuedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  rewardIssuedBy?: Types.ObjectId;
}

export const JourneyCardSchema = SchemaFactory.createForClass(JourneyCard);
