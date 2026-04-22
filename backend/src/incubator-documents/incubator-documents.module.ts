import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncubatorDocument } from './incubator-document.entity';
import { IncubatorDocumentsService } from './incubator-documents.service';
import { IncubatorDocumentsController } from './incubator-documents.controller';
import { IncubatorMember } from 'src/incubator-members/incubator-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncubatorDocument,  IncubatorMember,])],
  controllers: [IncubatorDocumentsController],
  providers: [IncubatorDocumentsService],
})
export class IncubatorDocumentsModule {}