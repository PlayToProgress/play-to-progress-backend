import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class Material {
  @Prop({
    type: String,
    required: true,
    enum: ['pdf', 'video', 'link', 'image'],
  })
  type!: 'pdf' | 'video' | 'link' | 'image';

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  url!: string;
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class SessionContent extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cohort', required: true })
  cohortId!: Types.ObjectId;

  @Prop({ type: Number, required: true })
  weekNumber!: number;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, default: '' })
  theme!: string;

  @Prop({ type: String, default: '' })
  description!: string;

  @Prop({ type: [Object], default: [] })
  materials!: Material[];

  @Prop({ type: String })
  coverImageUrl?: string;
}

export const SessionContentSchema =
  SchemaFactory.createForClass(SessionContent);
SessionContentSchema.index({ cohortId: 1, weekNumber: 1 }, { unique: true });
