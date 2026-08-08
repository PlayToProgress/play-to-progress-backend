import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ShowcaseEvent extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cohort', required: true })
  cohortId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, default: '' })
  description!: string;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ type: String, default: 'Newham, East London' })
  location!: string;

  @Prop({ type: Boolean, default: false })
  published!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;
}

export const ShowcaseEventSchema = SchemaFactory.createForClass(ShowcaseEvent);
