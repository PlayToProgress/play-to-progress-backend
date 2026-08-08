import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../schemas/project.schema';
import { ShowcaseEvent } from '../schemas/showcase-event.schema';
import {
  CreateShowcaseEventDto,
  UpdateShowcaseEventDto,
} from './dto/showcase-event.dto';

@Injectable()
export class ShowcaseService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(ShowcaseEvent.name) private eventModel: Model<ShowcaseEvent>,
  ) {}

  // Public, unauthenticated. NF-05: participants under 18 without explicit
  // publicShowcaseConsent must NEVER have their full name/photo exposed here —
  // enforced server-side so it can't be bypassed by calling the API directly.
  async getPublicGallery() {
    const projects = await this.projectModel
      .find({ status: 'approved', isPublic: true })
      .populate('participantId', 'name age publicShowcaseConsent avatarUrl')
      .sort({ approvedAt: -1 })
      .lean();

    const safeProjects = projects.map((p) => {
      const participant = p.participantId as unknown as {
        _id: string;
        name: string;
        age: number;
        publicShowcaseConsent: boolean;
        avatarUrl?: string;
      };
      const hasConsent = !!participant?.publicShowcaseConsent;

      return {
        id: p._id,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        reactions: p.reactions,
        approvedAt: p.approvedAt,
        creator: hasConsent
          ? { name: participant.name, avatarUrl: participant.avatarUrl }
          : { name: 'A Play to Progress Participant', avatarUrl: undefined },
      };
    });

    const events = await this.eventModel
      .find({ published: true })
      .sort({ date: -1 })
      .lean();

    return { projects: safeProjects, events };
  }

  findAllEvents() {
    return this.eventModel.find().sort({ date: -1 }).lean();
  }

  createEvent(dto: CreateShowcaseEventDto, createdBy: string) {
    return this.eventModel.create({ ...dto, createdBy });
  }

  async updateEvent(id: string, dto: UpdateShowcaseEventDto) {
    const event = await this.eventModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!event) throw new NotFoundException('Showcase event not found.');
    return event;
  }
}
