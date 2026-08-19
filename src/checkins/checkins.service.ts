import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckIn } from '../schemas/check-in.schema';
import { Participant } from '../schemas/participant.schema';
import { CreateCheckInDto } from './dto/create-checkin.dto';
import { toObjectId } from '../common/to-object-id';

// Mood 1-2 is treated as a wellbeing concern and flagged for coordinator review (NF-07).
const FLAG_THRESHOLD = 2;

@Injectable()
export class CheckinsService {
  constructor(
    @InjectModel(CheckIn.name) private checkInModel: Model<CheckIn>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
  ) {}

  async create(userId: string, dto: CreateCheckInDto) {
    const me = await this.participantModel.findOne({ userId: toObjectId(userId) });
    if (!me) throw new NotFoundException('Participant profile not found.');

    return this.checkInModel.create({
      ...dto,
      participantId: me._id,
      cohortId: me.cohortId,
      flagged: dto.mood <= FLAG_THRESHOLD,
    });
  }

  findAll(flaggedOnly: boolean) {
    const filter = flaggedOnly ? { flagged: true } : {};
    return this.checkInModel
      .find(filter)
      .populate('participantId', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  async resolve(id: string) {
    const checkIn = await this.checkInModel.findByIdAndUpdate(
      id,
      { resolvedByCoordinator: true },
      { new: true },
    );
    if (!checkIn) throw new NotFoundException('Check-in not found.');
    return checkIn;
  }
}