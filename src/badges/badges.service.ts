import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Badge } from '../schemas/badge.schema';
import { Participant } from '../schemas/participant.schema';
import { PartnerOrg } from '../schemas/partner-org.schema';
import { Parent } from '../schemas/parent.schema';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { AwardBadgeDto } from './dto/award-badge.dto';
import { labelForRecognitionBadge } from './recognition-badges';
import { toObjectId } from '../common/to-object-id';

@Injectable()
export class BadgesService {
  constructor(
    @InjectModel(Badge.name) private badgeModel: Model<Badge>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    @InjectModel(PartnerOrg.name) private partnerOrgModel: Model<PartnerOrg>,
    @InjectModel(Parent.name) private parentModel: Model<Parent>,
  ) {}

  // NF-04: a requested participantId is only honoured if it falls within the
  // caller's own scope — a partner/parent cannot read another venue's or
  // family's badges by simply passing a different id in the query string.
  async findScoped(user: AuthUser, participantId?: string) {
    if (user.role === 'participant') {
      const me = await this.participantModel.findOne({ userId: toObjectId(user.id) });
      if (!me) return [];
      return this.badgeModel
        .find({ participantId: me._id })
        .sort({ awardedAt: -1 })
        .lean();
    }

    if (user.role === 'partner') {
      const org = await this.partnerOrgModel.findOne({ userId: toObjectId(user.id) });
      if (!org) return [];
      const venueParticipants = await this.participantModel
        .find({ partnerOrgId: org._id })
        .select('_id');
      const venueIds = venueParticipants.map((p) => p._id.toString());
      if (participantId && !venueIds.includes(participantId)) return [];
      const filter = participantId
        ? { participantId }
        : { participantId: { $in: venueIds } };
      return this.badgeModel.find(filter).sort({ awardedAt: -1 }).lean();
    }

    if (user.role === 'parent') {
      const parent = await this.parentModel.findOne({ userId: toObjectId(user.id) });
      if (!parent) return [];
      const childIds = parent.participantIds.map((id) => id.toString());
      if (participantId && !childIds.includes(participantId)) return [];
      const filter = participantId
        ? { participantId }
        : { participantId: { $in: childIds } };
      return this.badgeModel.find(filter).sort({ awardedAt: -1 }).lean();
    }

    // coordinator: full access, optionally filtered
    if (!participantId) return [];
    return this.badgeModel
      .find({ participantId })
      .sort({ awardedAt: -1 })
      .lean();
  }


  async award(dto: AwardBadgeDto) {
    const participant = await this.participantModel.findById(dto.participantId);
    if (!participant) throw new NotFoundException('Participant not found.');

    return this.badgeModel.create({
      participantId: dto.participantId,
      type: dto.type,
      label: labelForRecognitionBadge(dto.type),
    });
  }
}