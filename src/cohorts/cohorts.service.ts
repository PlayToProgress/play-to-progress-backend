import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cohort } from '../schemas/cohort.schema';
import { CreateCohortDto, UpdateCohortDto } from './dto/cohort.dto';

@Injectable()
export class CohortsService {
  constructor(@InjectModel(Cohort.name) private cohortModel: Model<Cohort>) {}

  findAll() {
    return this.cohortModel.find().sort({ startDate: -1 }).lean();
  }

  async findOne(id: string) {
    const cohort = await this.cohortModel.findById(id).lean();
    if (!cohort) throw new NotFoundException('Cohort not found.');
    return cohort;
  }

  create(dto: CreateCohortDto) {
    return this.cohortModel.create(dto);
  }

  async update(id: string, dto: UpdateCohortDto) {
    const cohort = await this.cohortModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!cohort) throw new NotFoundException('Cohort not found.');
    return cohort;
  }

  async remove(id: string) {
    await this.cohortModel.findByIdAndDelete(id);
    return { ok: true };
  }
}
