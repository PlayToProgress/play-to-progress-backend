import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JourneyCard } from '../schemas/journey-card.schema';
import { Participant } from '../schemas/participant.schema';
import { PartnerOrg } from '../schemas/partner-org.schema';
import { Parent } from '../schemas/parent.schema';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { toObjectId } from '../common/to-object-id';

@Injectable()
export class JourneyCardService {
  constructor(
    @InjectModel(JourneyCard.name) private journeyCardModel: Model<JourneyCard>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    @InjectModel(PartnerOrg.name) private partnerOrgModel: Model<PartnerOrg>,
    @InjectModel(Parent.name) private parentModel: Model<Parent>,
  ) {}

  async findMine(userId: string) {
    const me = await this.participantModel.findOne({ userId: toObjectId(userId) });
    if (!me) throw new NotFoundException('Participant profile not found.');
    return this.journeyCardModel.findOne({ participantId: me._id }).lean();
  }

  // PC-01 / PC-02 / NF-04: a partner must only ever see cards for
  // participants enrolled at their own venue, and a parent must only ever
  // see cards for their own linked children. Coordinators see everything
  // (optionally filtered by the query params).
  async findScoped(
    user: AuthUser,
    participantId?: string,
    completedOnly?: boolean,
  ) {
    const filter: Record<string, unknown> = {};
    if (participantId) filter.participantId = participantId;
    if (completedOnly) filter.rewardUnlocked = true;

    if (user.role === 'partner') {
      const org = await this.partnerOrgModel.findOne({ userId: toObjectId(user.id) });
      if (!org) return [];
      const venueParticipants = await this.participantModel
        .find({ partnerOrgId: org._id })
        .select('_id');
      const venueIds = venueParticipants.map((p) => p._id.toString());
      filter.participantId = participantId
        ? venueIds.includes(participantId)
          ? participantId
          : { $in: [] } // requested a participant outside their venue — return nothing
        : { $in: venueIds };
    } else if (user.role === 'parent') {
      const parent = await this.parentModel.findOne({ userId: toObjectId(user.id) });
      if (!parent) return [];
      const childIds = parent.participantIds.map((id) => id.toString());
      filter.participantId = participantId
        ? childIds.includes(participantId)
          ? participantId
          : { $in: [] }
        : { $in: childIds };
    }
    // coordinator: no additional restriction beyond the optional query filters above

    return this.journeyCardModel
      .find(filter)
      .populate('participantId', 'name avatarUrl cohortId')
      .lean();
  }

  async issueReward(participantId: string, issuedBy: string) {
    const card = await this.journeyCardModel.findOne({ participantId });
    if (!card) throw new NotFoundException('Journey Card not found.');
    if (!card.rewardUnlocked) {
      throw new BadRequestException(
        'Reward not yet unlocked (10 stamps required).',
      );
    }

    card.rewardIssued = true;
    card.rewardIssuedAt = new Date();
    card.rewardIssuedBy = issuedBy as unknown as typeof card.rewardIssuedBy;
    await card.save();
    return card;
  }
}