import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Parent extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: [Types.ObjectId], ref: 'Participant', default: [] })
  participantIds!: Types.ObjectId[];
}

export const ParentSchema = SchemaFactory.createForClass(Parent);
