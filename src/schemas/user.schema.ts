import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRole =
  'admin' | 'coordinator' | 'participant' | 'partner' | 'parent';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({ type: String, required: true })
  passwordHash!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['admin', 'coordinator', 'participant', 'partner', 'parent'],
  })
  role!: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
