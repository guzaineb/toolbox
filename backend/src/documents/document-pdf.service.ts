import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import PDFDocument from 'pdfkit';
import { DOCUMENT_DEFINITIONS } from './documents.service';

@Injectable()
export class DocumentPdfService {
  private readonly logger = new Logger(DocumentPdfService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
  ) {}

  async generate(projectId: string, documentKey: string, userId: string): Promise<Buffer> {
    await this.access.assertCanAccessProject(projectId, userId);

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const def = DOCUMENT_DEFINITIONS.find(d => d.key === documentKey);
    if (!def) throw new NotFoundException(`Document inconnu: ${documentKey}`);

    const doc = await (this.prisma as any).generatedDocument.findUnique({
      where: {
        project_id_document_key: { project_id: projectId, document_key: documentKey },
      },
    });

    if (!doc?.content) throw new NotFoundException('Document non généré');

    return this.buildPdf(project.name, def.title, doc.content, doc.generated_at || new Date());
  }

  private buildPdf(projectName: string, title: string, content: string, generatedAt: Date): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `${title} — ${projectName}`,
          Author: 'Toolbox Vert',
          Subject: title,
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const green = '#2d7a52';
      const ink = '#1a1a2e';
      const ink2 = '#52525b';
      const ml = 50;
      const pw = doc.page.width - 100;

      // Header bar
      doc.rect(0, 0, doc.page.width, 60).fill(green);
      doc.fillColor('#fff').fontSize(10).font('Helvetica-Bold')
        .text('TOOLBOX VERT', ml, 18, { width: pw });
      doc.fillColor('#fff').fontSize(8).font('Helvetica')
        .text('ProjectStruct — Green Business Model', ml, 32, { width: pw });

      // Project name
      doc.fillColor(ink).fontSize(16).font('Helvetica-Bold')
        .text(projectName, ml, 80, { width: pw });

      // Document title
      doc.fillColor(green).fontSize(14).font('Helvetica-Bold')
        .text(title, ml, 110, { width: pw });

      // Separator
      doc.moveTo(ml, 135).lineTo(ml + pw, 135).lineWidth(1).strokeColor(green).stroke();

      // Generated date
      doc.fillColor(ink2).fontSize(8).font('Helvetica')
        .text(
          `Généré le ${generatedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          ml, 145,
        );

      // Content
      const contentStartY = 170;
      const maxContentHeight = doc.page.height - 120;
      let y = contentStartY;

      const paragraphs = content.split('\n').filter(p => p.trim());

      doc.font('Helvetica').fontSize(10).fillColor(ink);

      for (const paragraph of paragraphs) {
        const isSectionHeader = paragraph.startsWith('##') || paragraph.startsWith('**') || paragraph.endsWith(':');
        const cleanText = paragraph.replace(/^#+\s*/, '').replace(/\*\*/g, '');

        if (isSectionHeader) {
          doc.font('Helvetica-Bold').fontSize(11).fillColor(green);
          y = doc.text(cleanText, ml, y, { width: pw, lineGap: 4 }).y;
          doc.font('Helvetica').fontSize(10).fillColor(ink);
          y += 6;
        } else {
          y = doc.text(cleanText, ml, y, { width: pw, lineGap: 3 }).y;
          y += 6;
        }

        // Page break if needed
        if (y > doc.page.height - 100) {
          // Footer on current page
          this.addFooter(doc, projectName, title);
          doc.addPage();
          y = 50;
          doc.font('Helvetica').fontSize(10).fillColor(ink);
        }
      }

      // Footer on last page
      this.addFooter(doc, projectName, title);

      doc.end();
    });
  }

  private addFooter(doc: PDFKit.PDFDocument, projectName: string, title: string) {
    const ml = 50;
    const pw = doc.page.width - 100;
    const footerY = doc.page.height - 35;

    doc.moveTo(ml, footerY - 10).lineTo(ml + pw, footerY - 10).lineWidth(0.5).strokeColor('#dee2e6').stroke();

    doc.fontSize(7).font('Helvetica').fillColor('#52525b')
      .text(`${title} — ${projectName}`, ml, footerY, { width: pw * 0.6 });

    doc.text(
      `Page ${doc.bufferedPageRange().count}`,
      ml + pw * 0.6,
      footerY,
      { width: pw * 0.4, align: 'right' },
    );
  }
}
