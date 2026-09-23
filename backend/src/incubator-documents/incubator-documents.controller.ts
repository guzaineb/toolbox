import { Controller, Post, Param, UseGuards, Req, UseInterceptors, UploadedFile, Body, Get, Delete, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IncubatorDocumentsService } from './incubator-documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { VerifyDocumentDto } from './dto/verify-document.dto';

@Controller('incubators/:incubatorId/documents')
@UseGuards(JwtAuthGuard)
export class IncubatorDocumentsController {
  constructor(private docsService: IncubatorDocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads');
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${unique}${ext}`);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  async upload(
    @Param('incubatorId') incubatorId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Req() req,
  ) {
    console.log('📁 File saved at:', file.path);
    console.log('📁 File name:', file.filename);
    const fileUrl = `/uploads/${file.filename}`;
    return this.docsService.create(incubatorId, fileUrl, req.user.id, dto.document_type);
  }

  @Get()
  list(@Param('incubatorId') incubatorId: string) {
    return this.docsService.findByIncubator(incubatorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('incubatorId') incubatorId: string,
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.docsService.remove(id, incubatorId, req.user.id);
  }

  @Patch(':id/verify')
  async verify(
    @Param('incubatorId') incubatorId: string,
    @Param('id') id: string,
    @Body() dto: VerifyDocumentDto,
    @Req() req,
  ) {
    return this.docsService.verify(id, incubatorId, dto, req.user.id);
  }
}