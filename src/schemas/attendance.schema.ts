import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'late';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Attendance extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cohort', required: true })
  cohortId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Participant', required: true })
  participantId!: Types.ObjectId;

  @Prop({ type: Number, required: true })
  sessionNumber!: number;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ type: String, required: true, enum: ['present', 'absent', 'late'] })
  status!: AttendanceStatus;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  markedBy!: Types.ObjectId;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index(
  { participantId: 1, sessionNumber: 1 },
  { unique: true },
);
