import { Injectable, Logger } from '@nestjs/common';

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  private readonly apiKey = process.env.GROQ_API_KEY || '';
  private readonly baseUrl = 'https://api.groq.com/openai/v1/audio/transcriptions';
  private readonly model = 'whisper-large-v3';

  async transcribe(
    audioBuffer: Buffer,
    filename: string,
    mimeType: string,
    language?: 'fr' | 'en' | 'ar',
  ): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const formData = new FormData();

    const ext = filename.split('.').pop() || 'webm';
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
    formData.append('file', blob, filename || `recording.${ext}`);
    formData.append('model', this.model);
    formData.append('response_format', 'verbose_json');

    if (language) {
      formData.append('language', language);
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.error(
        `Groq Whisper error ${response.status}: ${response.statusText} — ${errorBody}`,
      );
      throw new Error(
        `Transcription failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json() as {
      text: string;
      language?: string;
      duration?: number;
    };

    this.logger.log(
      `Transcription OK: ${data.text.length} chars, lang=${data.language}, dur=${data.duration}s`,
    );

    return {
      text: data.text,
      language: data.language,
      duration: data.duration,
    };
  }
}
