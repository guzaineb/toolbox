import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { TranscriptionService } from './transcription.service';
import { VoiceController } from './voice.controller';

@Module({
  imports: [CommonModule],
  providers: [TranscriptionService],
  controllers: [VoiceController],
  exports: [TranscriptionService],
})
export class VoiceModule {}
