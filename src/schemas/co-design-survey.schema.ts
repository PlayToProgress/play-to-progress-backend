import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class SurveyQuestion {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: String, required: true })
  text!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['text', 'rating', 'multiple_choice'],
  })
  type!: 'text' | 'rating' | 'multiple_choice';

  @Prop({ type: [String] })
  options?: string[];
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class CoDesignSurvey extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cohort', required: true })
  cohortId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [Object], required: true })
  questions!: SurveyQuestion[];

  @Prop({ type: [String], enum: ['participant', 'parent', 'partner'] })
  targetAudience!: ('participant' | 'parent' | 'partner')[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  published!: boolean;
}

export const CoDesignSurveySchema =
  SchemaFactory.createForClass(CoDesignSurvey);
