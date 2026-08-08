import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class SurveyAnswer {
  @Prop({ type: String, required: true })
  questionId!: string;

  @Prop({ type: String, required: true })
  value!: string;
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class SurveyResponse extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CoDesignSurvey', required: true })
  surveyId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['participant', 'parent', 'partner'],
  })
  respondentRole!: 'participant' | 'parent' | 'partner';

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  respondentUserId!: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  answers!: SurveyAnswer[];
}

export const SurveyResponseSchema =
  SchemaFactory.createForClass(SurveyResponse);
SurveyResponseSchema.index(
  { surveyId: 1, respondentUserId: 1 },
  { unique: true },
);
