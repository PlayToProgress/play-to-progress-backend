import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class CheckIn extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Participant', required: true })
  participantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cohort', required: true })
  cohortId!: Types.ObjectId;

  @Prop({ type: Number, required: true })
  sessionNumber!: number;

  @Prop({ type: String, required: true, enum: ['start', 'end'] })
  stage!: 'start' | 'end';

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  mood!: number;

  @Prop({ type: String })
  comment?: string;

  @Prop({ type: Boolean, default: false })
  flagged!: boolean;

  @Prop({ type: Boolean, default: false })
  resolvedByCoordinator!: boolean;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);
