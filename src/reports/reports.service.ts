import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../schemas/participant.schema';
import { Attendance } from '../schemas/attendance.schema';
import { Badge } from '../schemas/badge.schema';
import { Project } from '../schemas/project.schema';
import { JourneyCard } from '../schemas/journey-card.schema';
import { CheckIn } from '../schemas/check-in.schema';
import { Cohort } from '../schemas/cohort.schema';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    @InjectModel(Badge.name) private badgeModel: Model<Badge>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(JourneyCard.name) private journeyCardModel: Model<JourneyCard>,
    @InjectModel(CheckIn.name) private checkInModel: Model<CheckIn>,
    @InjectModel(Cohort.name) private cohortModel: Model<Cohort>,
    private pdfService: PdfService,
  ) {}

  async getMetrics(cohortId?: string) {
    const participantFilter = cohortId ? { cohortId } : {};

    const [
      totalEnrolments,
      attendanceRecords,
      badgesAwarded,
      projectsSubmitted,
      projectsApproved,
      journeysCompleted,
      flaggedCheckIns,
    ] = await Promise.all([
      this.participantModel.countDocuments(participantFilter),
      this.attendanceModel.find(cohortId ? { cohortId } : {}).lean(),
      this.badgeModel.countDocuments(),
      this.projectModel.countDocuments({
        status: { $in: ['submitted', 'approved', 'rejected'] },
      }),
      this.projectModel.countDocuments({ status: 'approved' }),
      this.journeyCardModel.countDocuments({ rewardUnlocked: true }),
      this.checkInModel.countDocuments({
        flagged: true,
        resolvedByCoordinator: false,
      }),
    ]);

    const presentCount = attendanceRecords.filter(
      (a) => a.status === 'present',
    ).length;
    const attendanceRate = attendanceRecords.length
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 0;

    return {
      totalEnrolments,
      sessionAttendanceRate: attendanceRate,
      totalAttendanceRecords: attendanceRecords.length,
      badgesAwarded,
      projectsSubmitted,
      projectsApproved,
      journeysCompleted,
      unresolvedSafeguardingFlags: flaggedCheckIns,
    };
  }

  async buildFunderReportPdf(cohortId?: string): Promise<Uint8Array> {
    const filter = cohortId ? { cohortId } : {};
    const cohort = cohortId
      ? await this.cohortModel.findById(cohortId).lean()
      : null;
    const participants = await this.participantModel.find(filter).lean();
    const attendance = await this.attendanceModel
      .find(cohortId ? { cohortId } : {})
      .lean();
    const projects = await this.projectModel
      .find(cohortId ? { cohortId } : {})
      .lean();
    const badges = await this.badgeModel
      .find({ participantId: { $in: participants.map((p) => p._id) } })
      .lean();

    const present = attendance.filter((a) => a.status === 'present').length;
    const attendanceRate = attendance.length
      ? Math.round((present / attendance.length) * 100)
      : 0;

    const ageGroups = { '11-13': 0, '14-15': 0, '16-18': 0 };
    for (const p of participants) {
      if (p.age <= 13) ageGroups['11-13']++;
      else if (p.age <= 15) ageGroups['14-15']++;
      else ageGroups['16-18']++;
    }

    return this.pdfService.buildBrandedReportPdf({
      title: cohort
        ? `Funder Impact Report — ${cohort.name}`
        : 'Funder Impact Report — All Cohorts',
      subtitle: 'London City Airport Community Fund — Programme Evidence',
      generatedAt: new Date(),
      sections: [
        {
          heading: 'Participant Numbers',
          lines: [
            `Total beneficiaries enrolled: ${participants.length}`,
            `Age 11-13: ${ageGroups['11-13']}   Age 14-15: ${ageGroups['14-15']}   Age 16-18: ${ageGroups['16-18']}`,
          ],
        },
        {
          heading: 'Attendance & Engagement',
          lines: [
            `Total session attendance records: ${attendance.length}`,
            `Overall attendance rate: ${attendanceRate}%`,
          ],
        },
        {
          heading: 'Outcomes',
          lines: [
            `Projects submitted: ${projects.filter((p) => p.status !== 'draft').length}`,
            `Projects approved for public showcase: ${projects.filter((p) => p.status === 'approved').length}`,
            `Total badges awarded: ${badges.length}`,
            `Participants who completed their full 10-stamp Journey Card: ${
              badges.filter((b) => b.type === 'journey_complete').length
            }`,
          ],
        },
        {
          heading: 'Testimonials',
          lines: [
            'Testimonial capture is a Phase 2 enhancement. Session check-in comments are',
            'recorded in-platform and available to coordinators for qualitative reporting.',
          ],
        },
      ],
    });
  }

  async buildEvidencePackPdf(cohortId?: string): Promise<Uint8Array> {
    const filter = cohortId ? { cohortId } : {};
    const cohort = cohortId
      ? await this.cohortModel.findById(cohortId).lean()
      : null;
    const participants = await this.participantModel.find(filter).lean();
    const attendance = await this.attendanceModel
      .find(cohortId ? { cohortId } : {})
      .lean();
    const approvedProjects = await this.projectModel
      .find({ ...(cohortId ? { cohortId } : {}), status: 'approved' })
      .lean();
    const checkIns = await this.checkInModel
      .find({
        participantId: { $in: participants.map((p) => p._id) },
        comment: { $exists: true, $ne: '' },
      })
      .limit(15)
      .lean();

    const present = attendance.filter((a) => a.status === 'present').length;
    const attendanceRate = attendance.length
      ? Math.round((present / attendance.length) * 100)
      : 0;

    return this.pdfService.buildBrandedReportPdf({
      title: 'Funder Evidence Pack',
      subtitle: `${cohort ? cohort.name : 'All Cohorts'} — London City Airport Community Fund`,
      generatedAt: new Date(),
      sections: [
        {
          heading: '1. Programme Reach',
          lines: [
            `Beneficiaries reached: ${participants.length}`,
            'Free digital gaming & creative coding workshops delivered in Newham,',
            'in partnership with Oasis Academy Silvertown, Shipman Youth Zone, and Newham Council.',
          ],
        },
        {
          heading: '2. Attendance Evidence',
          lines: [
            `Session attendance records logged: ${attendance.length}`,
            `Overall attendance rate: ${attendanceRate}%`,
          ],
        },
        {
          heading: '3. Outcomes & Showcased Work',
          lines: [
            `Public showcase projects approved: ${approvedProjects.length}`,
            ...approvedProjects.slice(0, 10).map((p) => `  - "${p.title}"`),
          ],
        },
        {
          heading: '4. Participant Voice (session check-in comments)',
          lines:
            checkIns.length > 0
              ? checkIns.map((c) => `  - "${c.comment}"`)
              : ['  No free-text comments recorded yet for this cohort.'],
        },
        {
          heading: '5. Wellbeing & Safeguarding',
          lines: [
            'All session check-ins are monitored; low-mood responses are automatically',
            "flagged to coordinators for follow-up, in line with the programme's safeguarding protocol.",
          ],
        },
      ],
    });
  }
}
