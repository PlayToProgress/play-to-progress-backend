import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SessionContent } from '../schemas/session-content.schema';
import { UpsertContentDto } from './dto/upsert-content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(SessionContent.name)
    private contentModel: Model<SessionContent>,
  ) {}

  findByCohort(cohortId?: string) {
    const filter = cohortId ? { cohortId } : {};
    return this.contentModel.find(filter).sort({ weekNumber: 1 }).lean();
  }

  upsert(dto: UpsertContentDto) {
    return this.contentModel.findOneAndUpdate(
      { cohortId: dto.cohortId, weekNumber: dto.weekNumber },
      dto,
      { new: true, upsert: true },
    );
  }

  async update(id: string, dto: Partial<UpsertContentDto>) {
    const content = await this.contentModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!content) throw new NotFoundException('Session content not found.');
    return content;
  }

  async remove(id: string) {
    await this.contentModel.findByIdAndDelete(id);
    return { ok: true };
  }
}
