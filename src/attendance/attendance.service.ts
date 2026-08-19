import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from '../schemas/attendance.schema';
import { Participant } from '../schemas/participant.schema';
import { PartnerOrg } from '../schemas/partner-org.schema';
import { Parent } from '../schemas/parent.schema';
import { GamificationService } from '../gamification/gamification.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { toObjectId } from '../common/to-object-id';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    @InjectModel(PartnerOrg.name) private partnerOrgModel: Model<PartnerOrg>,
    @InjectModel(Parent.name) private parentModel: Model<Parent>,
    private gamificationService: GamificationService,
  ) {}

  async findScoped(
    user: AuthUser,
    filters: {
      cohortId?: string;
      sessionNumber?: number;
      participantId?: string;
    },
  ) {
    const filter: Record<string, unknown> = {};
    if (filters.cohortId) filter.cohortId = filters.cohortId;
    if (filters.sessionNumber) filter.sessionNumber = filters.sessionNumber;
    if (filters.participantId) filter.participantId = filters.participantId;

    if (user.role === 'partner') {
      const org = await this.partnerOrgModel.findOne({ userId: toObjectId(user.id) });
      const venueParticipants = org
        ? await this.participantModel
            .find({ partnerOrgId: org._id })
            .select('_id')
        : [];
      filter.participantId = { $in: venueParticipants.map((p) => p._id) };
    } else if (user.role === 'parent') {
      const parent = await this.parentModel.findOne({ userId: toObjectId(user.id) });
      filter.participantId = { $in: parent?.participantIds ?? [] };
    } else if (user.role === 'participant') {
      const me = await this.participantModel.findOne({ userId: toObjectId(user.id) });
      filter.participantId = me?._id;
    }

    return this.attendanceModel.find(filter).sort({ sessionNumber: 1 }).lean();
  }

  async mark(dto: MarkAttendanceDto, markedBy: string) {
    const { cohortId, participantId, sessionNumber, date, status, notes } = dto;

    const record = await this.attendanceModel.findOneAndUpdate(
      { participantId, sessionNumber },
      { cohortId, date: new Date(date), status, notes, markedBy },
      { new: true, upsert: true },
    );

    if (status === 'present') {
      await this.gamificationService.awardStampForAttendance(
        participantId,
        cohortId,
        sessionNumber,
      );
    } else {
      await this.gamificationService.revokeStampForSession(
        participantId,
        sessionNumber,
      );
    }

    return record;
  }
}