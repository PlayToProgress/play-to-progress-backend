import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reports')
@Roles('coordinator')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('metrics')
  getMetrics(@Query('cohortId') cohortId?: string) {
    return this.reportsService.getMetrics(cohortId);
  }

  @Get('funder')
  async getFunderReport(
    @Query('cohortId') cohortId: string | undefined,
    @Res() res: Response,
  ) {
    const pdfBytes = await this.reportsService.buildFunderReportPdf(cohortId);
    res
      .status(200)
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="play-to-progress-funder-report.pdf"',
      })
      .send(Buffer.from(pdfBytes));
  }

  @Get('evidence-pack')
  async getEvidencePack(
    @Query('cohortId') cohortId: string | undefined,
    @Res() res: Response,
  ) {
    const pdfBytes = await this.reportsService.buildEvidencePackPdf(cohortId);
    res
      .status(200)
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="play-to-progress-funder-evidence-pack.pdf"',
      })
      .send(Buffer.from(pdfBytes));
  }
}
