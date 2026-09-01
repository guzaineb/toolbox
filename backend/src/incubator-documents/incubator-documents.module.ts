import { Module } from '@nestjs/common';
import { IncubatorDocumentsService } from './incubator-documents.service';
import { IncubatorDocumentsController } from './incubator-documents.controller';

@Module({
  controllers: [IncubatorDocumentsController],
  providers: [IncubatorDocumentsService],
})
export class IncubatorDocumentsModule {}