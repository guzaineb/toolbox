import { Controller, Post, Param, UseGuards, Req, UseInterceptors, UploadedFile, Body, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IncubatorDocumentsService } from './incubator-documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Controller('incubators/:incubatorId/documents')
@UseGuards(JwtAuthGuard)
export class IncubatorDocumentsController {
  constructor(private docsService: IncubatorDocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const unique = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${unique}${ext}`);
      },
    }),
  }))
  async upload(
    @Param('incubatorId') incubatorId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Req() req,
  ) {
    const fileUrl = `/uploads/${file.filename}`;
    return this.docsService.create(incubatorId, fileUrl, req.user.id, dto.document_type);
  }

  @Get()
  list(@Param('incubatorId') incubatorId: string) {
    return this.docsService.findByIncubator(incubatorId);
  }
}