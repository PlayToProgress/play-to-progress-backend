import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { SchemasModule } from './schemas/schemas.module';
import { GamificationModule } from './gamification/gamification.module';
import { PdfModule } from './pdf/pdf.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CohortsModule } from './cohorts/cohorts.module';
import { PartnerOrgsModule } from './partner-orgs/partner-orgs.module';
import { ParentsModule } from './parents/parents.module';
import { ParticipantsModule } from './participants/participants.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ContentModule } from './content/content.module';
import { ProjectsModule } from './projects/projects.module';
import { BadgesModule } from './badges/badges.module';
import { CheckinsModule } from './checkins/checkins.module';
import { JourneyCardModule } from './journey-card/journey-card.module';
import { SurveysModule } from './surveys/surveys.module';
import { ShowcaseModule } from './showcase/showcase.module';
import { ReportsModule } from './reports/reports.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { requireEnv } from './common/require-env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: requireEnv(config, 'MONGODB_URI'),
      }),
    }),
    SchemasModule,
    GamificationModule,
    PdfModule,
    AuthModule,
    UsersModule,
    CohortsModule,
    PartnerOrgsModule,
    ParentsModule,
    ParticipantsModule,
    AttendanceModule,
    ContentModule,
    ProjectsModule,
    BadgesModule,
    CheckinsModule,
    JourneyCardModule,
    SurveysModule,
    ShowcaseModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
