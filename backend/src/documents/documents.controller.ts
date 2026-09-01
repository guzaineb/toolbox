import { Controller, Get, Post, Param, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { DocumentPdfService } from './document-pdf.service';

@Controller('projects/:projectId/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly docsService: DocumentsService,
    private readonly pdfService: DocumentPdfService,
  ) {}

  @Get()
  getDocumentsList(
    @Req() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    return this.docsService.getDocumentsList(projectId, req.user.id);
  }

  @Get(':documentKey')
  getDocument(
    @Req() req: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Param('documentKey') documentKey: string,
  ) {
    return this.docsService.getDocument(projectId, documentKey, req.user.id);
  }

  @Post(':documentKey/generate')
  generateDocument(
    @Req() req: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Param('documentKey') documentKey: string,
  ) {
    return this.docsService.generateDocument(projectId, documentKey, req.user.id);
  }

  @Post('generate-all')
  generateAllDocuments(
    @Req() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    return this.docsService.generateAllDocuments(projectId, req.user.id);
  }

  @Get(':documentKey/pdf')
  async downloadPdf(
    @Req() req: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Param('documentKey') documentKey: string,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generate(projectId, documentKey, req.user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${documentKey}-${projectId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
