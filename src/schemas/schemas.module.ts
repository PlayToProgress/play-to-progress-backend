import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Cohort, CohortSchema } from './cohort.schema';
import { PartnerOrg, PartnerOrgSchema } from './partner-org.schema';
import { Parent, ParentSchema } from './parent.schema';
import { Participant, ParticipantSchema } from './participant.schema';
import { Attendance, AttendanceSchema } from './attendance.schema';
import { SessionContent, SessionContentSchema } from './session-content.schema';
import { Project, ProjectSchema } from './project.schema';
import { Badge, BadgeSchema } from './badge.schema';
import { CheckIn, CheckInSchema } from './check-in.schema';
import {
  CoDesignSurvey,
  CoDesignSurveySchema,
} from './co-design-survey.schema';
import { SurveyResponse, SurveyResponseSchema } from './survey-response.schema';
import { JourneyCard, JourneyCardSchema } from './journey-card.schema';
import { ShowcaseEvent, ShowcaseEventSchema } from './showcase-event.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Cohort.name, schema: CohortSchema },
      { name: PartnerOrg.name, schema: PartnerOrgSchema },
      { name: Parent.name, schema: ParentSchema },
      { name: Participant.name, schema: ParticipantSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: SessionContent.name, schema: SessionContentSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Badge.name, schema: BadgeSchema },
      { name: CheckIn.name, schema: CheckInSchema },
      { name: CoDesignSurvey.name, schema: CoDesignSurveySchema },
      { name: SurveyResponse.name, schema: SurveyResponseSchema },
      { name: JourneyCard.name, schema: JourneyCardSchema },
      { name: ShowcaseEvent.name, schema: ShowcaseEventSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SchemasModule {}
