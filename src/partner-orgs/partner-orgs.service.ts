import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartnerOrg } from '../schemas/partner-org.schema';
import { toObjectId } from '../common/to-object-id';

@Injectable()
export class PartnerOrgsService {
  constructor(
    @InjectModel(PartnerOrg.name) private partnerOrgModel: Model<PartnerOrg>,
  ) {}

  findAll() {
    return this.partnerOrgModel.find().sort({ name: 1 }).lean();
  }

  async findByUserId(userId: string) {
    const org = await this.partnerOrgModel
      .findOne({ userId: toObjectId(userId) })
      .lean();
    if (!org)
      throw new NotFoundException('Partner organisation profile not found.');
    return org;
  }
}