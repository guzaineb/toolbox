import { Controller, Get, Param, Query, UseGuards, Res, Req } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';

@Controller('projects/:projectId/exports')
export class ExportsController {
  constructor(private exportsService: ExportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('json')
  async exportJson(@Param('projectId') projectId: string) {
    return this.exportsService.exportJson(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('html')
  async exportHtml(@Param('projectId') projectId: string, @Res() res: Response) {
    const html = await this.exportsService.exportHtml(projectId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="projet-rapport.html"`);
    res.send(html);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pdf')
  async exportPdf(@Param('projectId') projectId: string, @Res() res: Response) {
    const buffer = await this.exportsService.exportPdf(projectId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="projet-rapport.pdf"`);
    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Get('markdown')
  async exportMarkdown(@Param('projectId') projectId: string, @Res() res: Response) {
    const md = await this.exportsService.exportMarkdown(projectId);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="projet-rapport.md"`);
    res.send(md);
  }

  @UseGuards(JwtAuthGuard)
  @Get('csv')
  async exportCsv(@Param('projectId') projectId: string, @Res() res: Response) {
    const csv = await this.exportsService.exportCsv(projectId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="projet-etapes.csv"`);
    res.send(csv);
  }
}
