import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BadgeType =
  | 'first_session'
  | 'perfect_attendance_week'
  | 'module_complete'
  | 'project_submitted'
  | 'journey_complete'
  | 'confidence_builder'
  | 'goal_setter'
  | 'creative_thinker'
  | 'team_player';

@Schema({ timestamps: { createdAt: 'awardedAt', updatedAt: false } })
export class Badge extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Participant', required: true })
  participantId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: [
      'first_session',
      'perfect_attendance_week',
      'module_complete',
      'project_submitted',
      'journey_complete',
      'confidence_builder',
      'goal_setter',
      'creative_thinker',
      'team_player',
    ],
  })
  type!: BadgeType;

  @Prop({ type: String, required: true })
  label!: string;

  @Prop({ type: Number })
  sessionNumber?: number;

  declare awardedAt: Date;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);