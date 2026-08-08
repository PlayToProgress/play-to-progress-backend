import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { User, UserSchema } from '../src/schemas/user.schema';
import { Cohort, CohortSchema } from '../src/schemas/cohort.schema';
import {
  PartnerOrg,
  PartnerOrgSchema,
} from '../src/schemas/partner-org.schema';
import { Parent, ParentSchema } from '../src/schemas/parent.schema';
import {
  Participant,
  ParticipantSchema,
} from '../src/schemas/participant.schema';
import { Attendance, AttendanceSchema } from '../src/schemas/attendance.schema';
import {
  SessionContent,
  SessionContentSchema,
} from '../src/schemas/session-content.schema';
import { Project, ProjectSchema } from '../src/schemas/project.schema';
import {
  JourneyCard,
  JourneyCardSchema,
} from '../src/schemas/journey-card.schema';
import {
  ShowcaseEvent,
  ShowcaseEventSchema,
} from '../src/schemas/showcase-event.schema';
import { Badge, BadgeSchema } from '../src/schemas/badge.schema';

const PASSWORD = 'PlayToProgress2026!';

const UserModel = mongoose.model(User.name, UserSchema);
const CohortModel = mongoose.model(Cohort.name, CohortSchema);
const PartnerOrgModel = mongoose.model(PartnerOrg.name, PartnerOrgSchema);
const ParentModel = mongoose.model(Parent.name, ParentSchema);
const ParticipantModel = mongoose.model(Participant.name, ParticipantSchema);
const AttendanceModel = mongoose.model(Attendance.name, AttendanceSchema);
const SessionContentModel = mongoose.model(
  SessionContent.name,
  SessionContentSchema,
);
const ProjectModel = mongoose.model(Project.name, ProjectSchema);
const JourneyCardModel = mongoose.model(JourneyCard.name, JourneyCardSchema);
const ShowcaseEventModel = mongoose.model(
  ShowcaseEvent.name,
  ShowcaseEventSchema,
);
const BadgeModel = mongoose.model(Badge.name, BadgeSchema);

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function wipe() {
  const collections: mongoose.Model<any>[] = [
    UserModel,
    CohortModel,
    PartnerOrgModel,
    ParentModel,
    ParticipantModel,
    AttendanceModel,
    SessionContentModel,
    ProjectModel,
    JourneyCardModel,
    ShowcaseEventModel,
    BadgeModel,
  ];
  for (const c of collections) {
    await c.deleteMany({});
  }
}

// Forces every collection's actual indexes in MongoDB to match exactly what
// each schema declares — dropping anything not declared (e.g. a stale
// unique index left over from an earlier iteration of a schema, or from an
// unrelated collection that happened to share this database) and building
// anything that's missing. deleteMany() in wipe() only clears documents, it
// never touches indexes, so a rogue leftover index would otherwise survive
// every re-seed and keep breaking inserts (e.g. E11000 duplicate key errors
// on a field like "bookingId" that no current schema even defines).
async function syncAllIndexes() {
  const models: mongoose.Model<any>[] = [
    UserModel,
    CohortModel,
    PartnerOrgModel,
    ParentModel,
    ParticipantModel,
    AttendanceModel,
    SessionContentModel,
    ProjectModel,
    JourneyCardModel,
    ShowcaseEventModel,
    BadgeModel,
  ];
  for (const m of models) {
    await m.syncIndexes();
  }
}

// Mirrors GamificationService.awardStampForAttendance without needing a full
// Nest app context — the seed script talks to Mongoose directly.
async function awardStamp(
  participantId: mongoose.Types.ObjectId,
  cohortId: mongoose.Types.ObjectId,
  sessionNumber: number,
) {
  let card = await JourneyCardModel.findOne({ participantId });
  if (!card) {
    card = await JourneyCardModel.create({
      participantId,
      cohortId,
      stamps: [],
      stampCount: 0,
    });
  }
  card.stamps.push({ sessionNumber, earnedAt: new Date() });
  card.stampCount = card.stamps.length;

  if (card.stampCount === 1) {
    await BadgeModel.create({
      participantId,
      type: 'first_session',
      label: 'First Session Attended',
      sessionNumber,
    });
  }
  if (card.stampCount >= 10 && !card.rewardUnlocked) {
    card.rewardUnlocked = true;
    card.rewardUnlockedAt = new Date();
    await BadgeModel.create({
      participantId,
      type: 'journey_complete',
      label: 'Journey Card Complete — Reward Unlocked',
    });
  }
  await card.save();
  await ParticipantModel.updateOne(
    { _id: participantId },
    { $inc: { xp: 10 } },
  );
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri)
    throw new Error(
      'MONGODB_URI is not set. Add it to backend/.env before seeding.',
    );

  await mongoose.connect(uri);
  console.log('Connected. Synchronising indexes...');
  await syncAllIndexes();
  console.log('Indexes synced. Wiping existing data...');
  await wipe();

  const adminUser = await UserModel.create({
    name: 'Play to Progress Super Admin',
    email: 'admin@profitandplay.org',
    passwordHash: await hash(PASSWORD),
    role: 'admin',
  });
  console.log('Created super admin:', adminUser.email);

  // In the real app the coordinator below would be created BY the super
  // admin via POST /api/users (that's the whole point of the admin role —
  // bootstrapping the first coordinator). The seed script creates it
  // directly for demo convenience, but the relationship is the same one
  // the UI enforces: only an admin account can mint a coordinator account.
  const coordinatorUser = await UserModel.create({
    name: 'Amara Okafor',
    email: 'coordinator@profitandplay.org',
    passwordHash: await hash(PASSWORD),
    role: 'coordinator',
  });
  console.log('Created coordinator:', coordinatorUser.email);

  const partnerUser = await UserModel.create({
    name: 'Oasis Academy Silvertown',
    email: 'partner@oasissilvertown.org',
    passwordHash: await hash(PASSWORD),
    role: 'partner',
  });
  const partnerOrg = await PartnerOrgModel.create({
    userId: partnerUser._id,
    name: 'Oasis Academy Silvertown',
    venueType: 'Secondary School',
    address: 'Evelyn Road, Silvertown, London E16',
    description:
      'A secondary academy in Silvertown hosting Play to Progress sessions in its digital media suite.',
  });
  console.log('Created partner org:', partnerOrg.name);

  const cohort = await CohortModel.create({
    name: 'Summer 2026 Cohort — Newham',
    startDate: new Date('2026-07-06'),
    endDate: new Date('2026-08-24'),
    numSessions: 10,
    partnerOrgIds: [partnerOrg._id],
    status: 'active',
  });
  console.log('Created cohort:', cohort.name);

  const parentUser = await UserModel.create({
    name: 'Grace Adeyemi',
    email: 'parent@example.com',
    passwordHash: await hash(PASSWORD),
    role: 'parent',
  });
  const parent = await ParentModel.create({
    userId: parentUser._id,
    name: 'Grace Adeyemi',
    participantIds: [],
  });
  console.log('Created parent:', parent.name);

  const participantSeeds = [
    { name: 'Tobi Adeyemi', age: 13, stamps: 10, parent: true },
    { name: 'Zainab Hussain', age: 14, stamps: 8 },
    { name: 'Marcus Osei', age: 15, stamps: 6 },
    { name: 'Priya Chowdhury', age: 12, stamps: 4 },
    { name: 'Kayden Brown', age: 16, stamps: 2 },
    { name: 'Amelia Nwosu', age: 17, stamps: 0 },
  ];

  const participants: InstanceType<typeof ParticipantModel>[] = [];
  for (const s of participantSeeds) {
    const emailSlug = s.name.toLowerCase().replace(/\s+/g, '.');
    const user = await UserModel.create({
      name: s.name,
      email: `${emailSlug}@example.com`,
      passwordHash: await hash(PASSWORD),
      role: 'participant',
    });

    const participant = await ParticipantModel.create({
      userId: user._id,
      name: s.name,
      age: s.age,
      emergencyContact: 'Parent/Guardian — 07000 000000',
      digitalConsent: true,
      publicShowcaseConsent: s.stamps >= 6,
      cohortId: cohort._id,
      partnerOrgId: partnerOrg._id,
      parentId: s.parent ? parent._id : undefined,
    });

    if (s.parent) {
      parent.participantIds.push(participant._id);
      await parent.save();
    }

    await JourneyCardModel.create({
      participantId: participant._id,
      cohortId: cohort._id,
      stamps: [],
      stampCount: 0,
    });

    for (let session = 1; session <= s.stamps; session++) {
      await AttendanceModel.create({
        cohortId: cohort._id,
        participantId: participant._id,
        sessionNumber: session,
        date: new Date(2026, 6, 6 + (session - 1) * 7),
        status: 'present',
        markedBy: coordinatorUser._id,
      });
      await awardStamp(participant._id, cohort._id, session);
    }

    participants.push(participant);
    console.log(`Created participant: ${s.name} (${s.stamps} stamps)`);
  }

  const weeks = [
    { title: 'Welcome & Game Design Basics', theme: 'Game Design' },
    { title: 'Building Your First Game Level', theme: 'Game Design' },
    { title: 'Intro to Coding — Block to Text', theme: 'Coding' },
    { title: 'Coding Challenges & Debugging', theme: 'Coding' },
    { title: 'Digital Storytelling', theme: 'Storytelling' },
    { title: 'Character & World Building', theme: 'Storytelling' },
    { title: 'Teamwork & Project Sprints', theme: 'Teamwork' },
    { title: 'Final Project Polish', theme: 'Digital Creativity' },
  ];
  for (let i = 0; i < weeks.length; i++) {
    await SessionContentModel.create({
      cohortId: cohort._id,
      weekNumber: i + 1,
      title: weeks[i].title,
      theme: weeks[i].theme,
      description: `Week ${i + 1} of Play to Progress: ${weeks[i].title}. Hands-on activities delivered at Oasis Academy Silvertown.`,
      materials: [
        {
          type: 'pdf',
          title: 'Session Activity Guide',
          url: 'https://example.org/guide.pdf',
        },
        {
          type: 'video',
          title: 'Warm-up Video',
          url: 'https://example.org/warmup.mp4',
        },
      ],
    });
  }
  console.log('Created 8 weeks of session content.');

  const [tobi, zainab, marcus] = participants;
  await ProjectModel.create({
    participantId: tobi._id,
    cohortId: cohort._id,
    title: 'Silvertown Sprint — a platformer game',
    description:
      'A 2D platformer built during the coding weeks, featuring an original character and three levels set around Newham landmarks.',
    status: 'approved',
    isPublic: true,
    submittedAt: new Date('2026-08-10'),
    approvedBy: coordinatorUser._id,
    approvedAt: new Date('2026-08-11'),
  });
  await ProjectModel.create({
    participantId: zainab._id,
    cohortId: cohort._id,
    title: 'Voices of Newham — interactive story',
    description:
      "A branching digital story exploring young people's hopes for their community.",
    status: 'approved',
    isPublic: true,
    submittedAt: new Date('2026-08-09'),
    approvedBy: coordinatorUser._id,
    approvedAt: new Date('2026-08-10'),
  });
  await ProjectModel.create({
    participantId: marcus._id,
    cohortId: cohort._id,
    title: 'Team Quiz Game (work in progress)',
    description:
      'A trivia game built collaboratively during the teamwork sprint week.',
    status: 'submitted',
    isPublic: false,
    submittedAt: new Date('2026-08-12'),
  });
  console.log('Created sample projects.');

  await ShowcaseEventModel.create({
    cohortId: cohort._id,
    title: 'Play to Progress — Summer Showcase 2026',
    description:
      "Join us as our first cohort of young people present the games, stories, and digital projects they've built over 8 weeks.",
    date: new Date('2026-08-28T17:00:00'),
    location: 'Shipman Youth Zone, Newham',
    published: true,
    createdBy: coordinatorUser._id,
  });
  console.log('Created showcase event.');

  console.log('\nSeed complete.\n');
  console.log('Demo credentials (all use password: ' + PASSWORD + '):');
  console.log(`  Admin:       ${adminUser.email}`);
  console.log(`  Coordinator: ${coordinatorUser.email}`);
  console.log(`  Partner:     ${partnerUser.email}`);
  console.log(`  Parent:      ${parentUser.email}`);
  console.log(
    `  Participant: tobi.adeyemi@example.com (10 stamps, journey complete)`,
  );

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});