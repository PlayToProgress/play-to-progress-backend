import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../schemas/project.schema';
import { Participant } from '../schemas/participant.schema';
import { PartnerOrg } from '../schemas/partner-org.schema';
import { Parent } from '../schemas/parent.schema';
import { Badge } from '../schemas/badge.schema';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    @InjectModel(PartnerOrg.name) private partnerOrgModel: Model<PartnerOrg>,
    @InjectModel(Parent.name) private parentModel: Model<Parent>,
    @InjectModel(Badge.name) private badgeModel: Model<Badge>,
  ) {}

  async findScoped(user: AuthUser, participantId?: string) {
    const filter: Record<string, unknown> = {};
    if (participantId) filter.participantId = participantId;

    if (user.role === 'participant') {
      const me = await this.participantModel.findOne({ userId: user.id });
      filter.participantId = me?._id;
    } else if (user.role === 'partner') {
      const org = await this.partnerOrgModel.findOne({ userId: user.id });
      const venueParticipants = org
        ? await this.participantModel
            .find({ partnerOrgId: org._id })
            .select('_id')
        : [];
      filter.participantId = { $in: venueParticipants.map((p) => p._id) };
    } else if (user.role === 'parent') {
      const parent = await this.parentModel.findOne({ userId: user.id });
      filter.participantId = { $in: parent?.participantIds ?? [] };
    }

    return this.projectModel
      .find(filter)
      .populate('participantId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(user: AuthUser, dto: CreateProjectDto) {
    const me = await this.participantModel.findOne({ userId: user.id });
    if (!me) throw new NotFoundException('Participant profile not found.');

    const { submit, ...rest } = dto;
    const project = await this.projectModel.create({
      ...rest,
      participantId: me._id,
      cohortId: me.cohortId,
      status: submit ? 'submitted' : 'draft',
      submittedAt: submit ? new Date() : undefined,
    });

    if (submit) {
      await this.badgeModel.create({
        participantId: me._id,
        type: 'project_submitted',
        label: `Project Submitted: ${project.title}`,
      });
    }

    return project;
  }

  async update(user: AuthUser, id: string, dto: UpdateProjectDto) {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found.');

    const { submit, decision, ...fields } = dto;

    if (decision) {
      if (user.role !== 'coordinator' && user.role !== 'admin') {
        throw new ForbiddenException('Only coordinators can approve projects.');
      }
      project.status = decision === 'approve' ? 'approved' : 'rejected';
      project.approvedBy =
        decision === 'approve'
          ? (user.id as unknown as typeof project.approvedBy)
          : project.approvedBy;
      project.approvedAt = new Date();
    } else {
      const me = await this.participantModel.findOne({ userId: user.id });
      if (!me || me._id.toString() !== project.participantId.toString()) {
        throw new ForbiddenException('Forbidden');
      }
      Object.assign(project, fields);
      if (submit && project.status === 'draft') {
        project.status = 'submitted';
        project.submittedAt = new Date();
      }
    }

    await project.save();
    return project;
  }
}
