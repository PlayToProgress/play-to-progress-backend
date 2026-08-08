import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const GOLD = rgb(0.788, 0.635, 0.153); // approx #C9A227
const BLACK = rgb(0.04, 0.04, 0.04);
const WHITE = rgb(1, 1, 1);

export interface ReportSection {
  heading: string;
  lines: string[];
}

@Injectable()
export class PdfService {
  async buildBrandedReportPdf(opts: {
    title: string;
    subtitle: string;
    generatedAt: Date;
    sections: ReportSection[];
  }): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const regular = await doc.embedFont(StandardFonts.Helvetica);

    let page = doc.addPage([595.28, 841.89]); // A4
    const margin = 50;
    let y = 841.89 - margin;

    const newPageIfNeeded = (spaceNeeded: number) => {
      if (y - spaceNeeded < margin) {
        page = doc.addPage([595.28, 841.89]);
        y = 841.89 - margin;
      }
    };

    page.drawRectangle({
      x: 0,
      y: 841.89 - 90,
      width: 595.28,
      height: 90,
      color: BLACK,
    });
    page.drawText('PROFIT + PLAY', {
      x: margin,
      y: 841.89 - 45,
      size: 20,
      font: bold,
      color: WHITE,
    });
    page.drawText('Play to Progress — Funder Evidence', {
      x: margin,
      y: 841.89 - 65,
      size: 10,
      font: regular,
      color: GOLD,
    });
    y = 841.89 - 115;

    page.drawText(opts.title, {
      x: margin,
      y,
      size: 16,
      font: bold,
      color: BLACK,
    });
    y -= 20;
    page.drawText(opts.subtitle, {
      x: margin,
      y,
      size: 10,
      font: regular,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 14;
    page.drawText(`Generated: ${opts.generatedAt.toLocaleString('en-GB')}`, {
      x: margin,
      y,
      size: 9,
      font: regular,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 30;

    for (const section of opts.sections) {
      newPageIfNeeded(40);
      page.drawText(section.heading, {
        x: margin,
        y,
        size: 12,
        font: bold,
        color: BLACK,
      });
      page.drawLine({
        start: { x: margin, y: y - 4 },
        end: { x: 545, y: y - 4 },
        thickness: 1,
        color: GOLD,
      });
      y -= 20;

      for (const line of section.lines) {
        newPageIfNeeded(16);
        page.drawText(line, {
          x: margin,
          y,
          size: 10,
          font: regular,
          color: BLACK,
        });
        y -= 16;
      }
      y -= 12;
    }

    return doc.save();
  }
}
