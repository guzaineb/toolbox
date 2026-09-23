import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
] as const;

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'] as const;

export interface ExtractedText {
  text: string;
  pageCount?: number;
}

@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);

  async extract(filePath: string, mimeType: string): Promise<ExtractedText> {
    const ext = path.extname(filePath).toLowerCase();

    if (!SUPPORTED_MIME_TYPES.includes(mimeType as any) && !SUPPORTED_EXTENSIONS.includes(ext as any)) {
      throw new BadRequestException(
        `Format non supporté: ${mimeType} (${ext}). Formats acceptés: PDF, DOCX, TXT, MD`,
      );
    }

    try {
      if (mimeType === 'application/pdf' || ext === '.pdf') {
        return this.extractPdf(filePath);
      }

      if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        ext === '.docx'
      ) {
        return this.extractDocx(filePath);
      }

      return this.extractText(filePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Text extraction failed for ${filePath}: ${message}`);
      throw new BadRequestException(`Extraction du texte échouée: ${message}`);
    }
  }

  private async extractPdf(filePath: string): Promise<ExtractedText> {
    const pdfParse = await import('pdf-parse');
    const pdfFn = (pdfParse as any).default || pdfParse;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfFn(buffer);

    return {
      text: data.text,
      pageCount: data.numpages,
    };
  }

  private async extractDocx(filePath: string): Promise<ExtractedText> {
    const mammoth = await import('mammoth');
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages.length > 0) {
      this.logger.warn(
        `DOCX extraction warnings: ${result.messages.map((m) => m.message).join(', ')}`,
      );
    }

    return {
      text: result.value,
    };
  }

  private async extractText(filePath: string): Promise<ExtractedText> {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { text: content };
  }

  isSupported(mimeType: string): boolean {
    return SUPPORTED_MIME_TYPES.includes(mimeType as any);
  }

  isSupportedByExtension(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext as any);
  }
}
