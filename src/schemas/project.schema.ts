import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Project extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Participant', required: true })
  participantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cohort', required: true })
  cohortId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({ type: String })
  imageUrl?: string;

  @Prop({ type: String })
  fileUrl?: string;

  @Prop({
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft',
  })
  status!: ProjectStatus;

  @Prop({ type: Boolean, default: false })
  isPublic!: boolean;

  @Prop({ type: Date })
  submittedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Number, default: 0 })
  reactions!: number;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
