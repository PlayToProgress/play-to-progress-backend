import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PartnerOrg extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, default: 'Community Partner' })
  venueType!: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  photoUrl?: string;
}

export const PartnerOrgSchema = SchemaFactory.createForClass(PartnerOrg);
