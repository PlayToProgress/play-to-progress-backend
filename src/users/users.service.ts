import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../schemas/user.schema';
import { Participant } from '../schemas/participant.schema';
import { PartnerOrg } from '../schemas/partner-org.schema';
import { Parent } from '../schemas/parent.schema';
import { JourneyCard } from '../schemas/journey-card.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';

// Which roles a given acting role is permitted to create. Admin is the only
// role allowed to mint new admin or coordinator accounts — this is what
// closes the "any coordinator can create infinite coordinators" gap and is
// also the answer to "how does the first coordinator ever get created":
// the seeded super admin creates it.
const CREATABLE_ROLES_BY_ACTOR: Record<string, string[]> = {
  admin: ['admin', 'coordinator', 'partner', 'parent', 'participant'],
  coordinator: ['partner', 'parent', 'participant'],
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    @InjectModel(PartnerOrg.name) private partnerOrgModel: Model<PartnerOrg>,
    @InjectModel(Parent.name) private parentModel: Model<Parent>,
    @InjectModel(JourneyCard.name) private journeyCardModel: Model<JourneyCard>,
  ) {}

  async findAll() {
    return this.userModel
      .find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(actingUser: AuthUser, dto: CreateUserDto) {
    const allowedRoles = CREATABLE_ROLES_BY_ACTOR[actingUser.role] ?? [];
    if (!allowedRoles.includes(dto.role)) {
      throw new ForbiddenException(
        `A ${actingUser.role} account cannot create a ${dto.role} account.`,
      );
    }

    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role,
    });

    let profile: unknown = null;

    try {
      if (dto.role === 'participant') {
        if (!dto.age || !dto.emergencyContact || !dto.cohortId) {
          throw new BadRequestException(
            'age, emergencyContact, and cohortId are required to register a participant.',
          );
        }
        const participant = await this.participantModel.create({
          userId: user._id,
          name: dto.name,
          age: dto.age,
          contactDetails: dto.contactDetails,
          emergencyContact: dto.emergencyContact,
          digitalConsent: dto.digitalConsent ?? false,
          publicShowcaseConsent: dto.publicShowcaseConsent ?? false,
          cohortId: dto.cohortId,
          partnerOrgId: dto.partnerOrgId,
          parentId: dto.parentId,
        });
        await this.journeyCardModel.create({
          participantId: participant._id,
          cohortId: dto.cohortId,
          stamps: [],
          stampCount: 0,
        });
        if (dto.parentId) {
          await this.parentModel.findByIdAndUpdate(dto.parentId, {
            $addToSet: { participantIds: participant._id },
          });
        }
        profile = participant;
      } else if (dto.role === 'partner') {
        profile = await this.partnerOrgModel.create({
          userId: user._id,
          name: dto.name,
          venueType: dto.venueType,
          address: dto.address,
          description: dto.description,
          photoUrl: dto.photoUrl,
        });
      } else if (dto.role === 'parent') {
        profile = await this.parentModel.create({
          userId: user._id,
          name: dto.name,
          participantIds: dto.participantIds ?? [],
        });
      }
      // 'admin' and 'coordinator' roles have no separate profile document —
      // just the User row, same as today.
    } catch (err) {
      // Roll back the auth account if profile creation failed, so we never
      // leave an orphaned login with no matching participant/partner/parent record.
      await this.userModel.findByIdAndDelete(user._id);
      throw err;
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    };
  }

  // Admin/coordinator-initiated reset for someone else's account (e.g. they
  // lost their password and have no way to reset it themselves — there is
  // no email-based flow in this system, so this is the operational
  // equivalent). Uses the exact same permission map as account creation:
  // if you're allowed to create a role, you're allowed to reset its password.
  async resetPassword(
    actingUser: AuthUser,
    targetUserId: string,
    newPassword: string,
  ) {
    const target = await this.userModel.findById(targetUserId);
    if (!target) throw new NotFoundException('Account not found.');

    const allowedRoles = CREATABLE_ROLES_BY_ACTOR[actingUser.role] ?? [];
    if (!allowedRoles.includes(target.role)) {
      throw new ForbiddenException(
        `A ${actingUser.role} account cannot reset a ${target.role} account's password.`,
      );
    }

    target.passwordHash = await bcrypt.hash(newPassword, 10);
    await target.save();
    return { ok: true };
  }
}
