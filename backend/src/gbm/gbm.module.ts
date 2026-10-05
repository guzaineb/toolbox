import { Module } from '@nestjs/common';
import { GbmController } from './gbm.controller';
import { GbmService } from './gbm.service';
import { BmcPdfService } from './bmc-pdf.service';
import { AiModule } from '../ai/ai.module';
@Module({
  imports: [AiModule],
  controllers: [GbmController],
  providers: [GbmService, BmcPdfService],
  exports: [GbmService],
})
export class GbmModule {}
