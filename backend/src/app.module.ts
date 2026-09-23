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
import { EventsModule } from './events/events.module';
import { UploadsModule } from './uploads/uploads.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { ProjectsModule } from './projects/projects.module';
import { GbmModule } from './gbm/gbm.module';
import { BusinessPlanModule } from './business-plan/business-plan.module';
import { EcoDesignModule } from './eco-design/eco-design.module';
import { FundingModule } from './funding/funding.module';
import { MarketModule } from './market/market.module';
import { ImpactModule } from './impact/impact.module';
import { SwotModule } from './swot/swot.module';
import { DocumentsModule } from './documents/documents.module';
import { CohortsModule } from './cohorts/cohorts.module';
import { CohortParticipationsModule } from './cohort-participations/cohort-participations.module';
import { CohortExpertsModule } from './cohort-experts/cohort-experts.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { CoachingModule } from './coaching/coaching.module';
import { FinalDecisionsModule } from './final-decisions/final-decisions.module';
import { JuriesModule } from './juries/juries.module';
import { MaturityModule } from './maturity/maturity.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    IncubatorsModule, IncubatorMembersModule, IncubatorDocumentsModule,
    AuthModule, UsersModule, ProfilesModule, ProjectOwnerModule,
    ExpertModule, UploadsModule,
    ProjectsModule,
    GbmModule, BusinessPlanModule, EcoDesignModule,
    FundingModule, MarketModule, ImpactModule,
    SwotModule, DocumentsModule,
    CohortsModule,
    CohortParticipationsModule,
    CohortExpertsModule,
    EvaluationsModule,
    NotificationsModule,
    EventsModule,
    AuditModule,
    AssignmentsModule,
    CoachingModule,
    FinalDecisionsModule,
    JuriesModule,
    MaturityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
