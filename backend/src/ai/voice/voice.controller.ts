import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { TranscriptionService } from './transcription.service';

type RequestUser = { user: { id: string } };

const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/x-m4a',
];

@Controller('ai/voice')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(
    private readonly transcription: TranscriptionService,
    private readonly access: ModuleAccessService,
  ) {}

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: { fileSize: MAX_AUDIO_SIZE },
    }),
  )
  async transcribe(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
    @Body('language') language?: string,
    @Req() req?: RequestUser,
  ) {
    if (!projectId) {
      throw new HttpException('projectId is required', HttpStatus.BAD_REQUEST);
    }

    if (req) {
      await this.access.assertCanAccessProject(projectId, req.user.id);
    }

    if (!file) {
      throw new HttpException('Audio file is required', HttpStatus.BAD_REQUEST);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new HttpException(
        `Unsupported audio format: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (file.size > MAX_AUDIO_SIZE) {
      throw new HttpException(
        `Audio file too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 25MB`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const validLangs = ['fr', 'en', 'ar'];
    const lang = language && validLangs.includes(language) ? language : undefined;

    try {
      const result = await this.transcription.transcribe(
        file.buffer,
        file.originalname,
        file.mimetype,
        lang as 'fr' | 'en' | 'ar' | undefined,
      );

      return {
        success: true,
        data: {
          text: result.text,
          language: result.language,
          duration: result.duration,
        },
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Transcription failed';
      throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
