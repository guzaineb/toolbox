import { Controller, Post, Get, Param, UseGuards, Req, Delete, UseInterceptors, UploadedFile, Body, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body('document_type') documentType: string,
    @Body('step_id') stepId?: string,
  ) {
    if (!file) throw new Error('Fichier requis');
    return this.documentsService.upload(projectId, req.user.id, documentType, file, stepId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findByProject(@Param('projectId') projectId: string) {
    return this.documentsService.findByProject(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/verify')
  verify(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected',
    @Body('reason') reason?: string,
  ) {
    return this.documentsService.verify(id, status, reason);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
