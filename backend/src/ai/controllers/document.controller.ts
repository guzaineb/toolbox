import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { DocumentService } from '../documents/document.service';
import { UploadDocumentDto, DocumentIdDto } from '../dto/document.dto';

type RequestUser = { user: { id: string } };

const UPLOAD_TEMP_DIR = path.join(process.cwd(), 'uploads', 'temp');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
];

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non supporté: ${file.mimetype}. Autorisés: PDF, DOCX, DOC, TXT, MD`), false);
  }
}

@Controller('ai/documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly access: ModuleAccessService,
  ) {
    if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
      fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
            fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });
          }
          cb(null, UPLOAD_TEMP_DIR);
        },
        filename: (req, file, cb) => {
          const unique = uuidv4();
          const ext = path.extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
      fileFilter,
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Req() req: RequestUser,
  ) {
    await this.access.assertCanAccessProject(dto.projectId, req.user.id);

    try {
      const result = await this.documentService.upload(dto.projectId, req.user.id, file);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ success: false, message }, status);
    }
  }

  @Post('index')
  async indexDocument(@Body() dto: DocumentIdDto, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(dto.projectId, req.user.id);

    try {
      const result = await this.documentService.indexDocument(
        dto.documentId,
        dto.projectId,
        req.user.id,
      );
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ success: false, message }, status);
    }
  }

  @Post('reindex')
  async reindexDocument(@Body() dto: DocumentIdDto, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(dto.projectId, req.user.id);

    try {
      const result = await this.documentService.reindexDocument(
        dto.documentId,
        dto.projectId,
        req.user.id,
      );
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ success: false, message }, status);
    }
  }

  @Delete(':documentId')
  async deleteDocument(
    @Param('documentId') documentId: string,
    @Query('projectId') projectId: string,
    @Req() req: RequestUser,
  ) {
    await this.access.assertCanAccessProject(projectId, req.user.id);

    try {
      await this.documentService.deleteDocument(documentId, projectId, req.user.id);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ success: false, message }, status);
    }
  }

  @Get()
  async listDocuments(
    @Query('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: RequestUser,
  ) {
    await this.access.assertCanAccessProject(projectId, req!.user.id);

    try {
      const result = await this.documentService.listByProject(
        projectId,
        req!.user.id,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      );
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException({ success: false, message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':documentId')
  async getDocument(
    @Param('documentId') documentId: string,
    @Query('projectId') projectId: string,
    @Req() req: RequestUser,
  ) {
    await this.access.assertCanAccessProject(projectId, req.user.id);

    try {
      const result = await this.documentService.getById(documentId, projectId, req.user.id);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ success: false, message }, status);
    }
  }
}
