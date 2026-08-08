import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Participant extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Number, required: true, min: 11, max: 18 })
  age!: number;

  @Prop({ type: String })
  contactDetails?: string;

  @Prop({ type: String, required: true })
  emergencyContact!: string;

  @Prop({ type: Boolean, required: true, default: false })
  digitalConsent!: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  publicShowcaseConsent!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Cohort', required: true })
  cohortId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PartnerOrg' })
  partnerOrgId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Parent' })
  parentId?: Types.ObjectId;

  @Prop({ type: String })
  avatarUrl?: string;

  @Prop({ type: Number, default: 0 })
  xp!: number;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
