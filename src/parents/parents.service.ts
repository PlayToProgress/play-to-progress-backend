import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parent } from '../schemas/parent.schema';

@Injectable()
export class ParentsService {
  constructor(@InjectModel(Parent.name) private parentModel: Model<Parent>) {}

  findAll() {
    return this.parentModel
      .find()
      .select('name participantIds')
      .sort({ name: 1 })
      .lean();
  }
}
