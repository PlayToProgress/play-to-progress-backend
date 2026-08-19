import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../schemas/participant.schema';
import { PartnerOrg } from '../schemas/partner-org.schema';
import { Parent } from '../schemas/parent.schema';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { toObjectId } from '../common/to-object-id';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    @InjectModel(PartnerOrg.name) private partnerOrgModel: Model<PartnerOrg>,
    @InjectModel(Parent.name) private parentModel: Model<Parent>,
  ) {}

  async findScoped(user: AuthUser, cohortId?: string) {
    const filter: Record<string, unknown> = {};
    if (cohortId) filter.cohortId = cohortId;

    if (user.role === 'coordinator') {
      // full visibility
    } else if (user.role === 'partner') {
      const org = await this.partnerOrgModel.findOne({ userId: toObjectId(user.id) });
      if (!org) return [];
      filter.partnerOrgId = org._id;
    } else if (user.role === 'parent') {
      const parent = await this.parentModel.findOne({ userId: toObjectId(user.id) });
      if (!parent) return [];
      filter._id = { $in: parent.participantIds };
    } else if (user.role === 'participant') {
      filter.userId = toObjectId(user.id);
    }

    return this.participantModel
      .find(filter)
      .populate('cohortId', 'name status')
      .populate('partnerOrgId', 'name')
      .lean();
  }

  async findMe(userId: string) {
    const participant = await this.participantModel
      .findOne({ userId: toObjectId(userId) })
      .populate('cohortId', 'name status startDate endDate numSessions')
      .lean();
    if (!participant)
      throw new NotFoundException('Participant profile not found.');
    return participant;
  }

  async canView(user: AuthUser, participantId: string): Promise<boolean> {
    if (user.role === 'admin' || user.role === 'coordinator') return true;

    const participant = await this.participantModel.findById(participantId);
    if (!participant) return false;

    if (user.role === 'participant') {
      return participant.userId.toString() === user.id;
    }
    if (user.role === 'partner') {
      const org = await this.partnerOrgModel.findOne({ userId: toObjectId(user.id) });
      return (
        !!org && participant.partnerOrgId?.toString() === org._id.toString()
      );
    }
    if (user.role === 'parent') {
      const parent = await this.parentModel.findOne({ userId: toObjectId(user.id) });
      return (
        !!parent &&
        parent.participantIds.some((id) => id.toString() === participantId)
      );
    }
    return false;
  }

  async findOneScoped(user: AuthUser, id: string) {
    const allowed = await this.canView(user, id);
    if (!allowed) throw new ForbiddenException('Forbidden');

    const participant = await this.participantModel
      .findById(id)
      .populate('cohortId', 'name status startDate endDate')
      .populate('partnerOrgId', 'name')
      .lean();
    if (!participant) throw new NotFoundException('Participant not found.');
    return participant;
  }

  async update(id: string, dto: UpdateParticipantDto) {
    const participant = await this.participantModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!participant) throw new NotFoundException('Participant not found.');
    return participant;
  }
}