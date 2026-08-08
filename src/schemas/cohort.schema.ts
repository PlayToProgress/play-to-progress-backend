import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CohortStatus = 'planned' | 'active' | 'completed';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Cohort extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Date, required: true })
  startDate!: Date;

  @Prop({ type: Date, required: true })
  endDate!: Date;

  @Prop({ type: Number, required: true, default: 8 })
  numSessions!: number;

  @Prop({ type: [Types.ObjectId], ref: 'PartnerOrg', default: [] })
  partnerOrgIds!: Types.ObjectId[];

  @Prop({
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned',
  })
  status!: CohortStatus;
}

export const CohortSchema = SchemaFactory.createForClass(Cohort);
