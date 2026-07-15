import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncubatorsModule } from './incubators/incubators.module';
import { IncubatorMembersModule } from './incubator-members/incubator-members.module';
import { IncubatorDocumentsModule } from './incubator-documents/incubator-documents.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExpertModule } from './expert/expert.module';
import { ProjectOwnerModule } from './project-owner/project-owner.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { UploadsModule } from './uploads/uploads.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { GbmModule } from './gbm/gbm.module';
import { BusinessPlanModule } from './business-plan/business-plan.module';
import { EcoDesignModule } from './eco-design/eco-design.module';
import { FundingModule } from './funding/funding.module';
import { MarketModule } from './market/market.module';
import { ImpactModule } from './impact/impact.module';
import { SwotModule } from './swot/swot.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    IncubatorsModule, IncubatorMembersModule, IncubatorDocumentsModule,
    AuthModule, UsersModule, ProfilesModule, ProjectOwnerModule,
    ExpertModule, UploadsModule,
    ProjectsModule,
    GbmModule, BusinessPlanModule, EcoDesignModule,
    FundingModule, MarketModule, ImpactModule,
    SwotModule, DocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule { }
