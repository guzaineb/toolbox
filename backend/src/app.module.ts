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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail/mail.service';
import { UploadsModule } from './uploads/uploads.module';
import { ProjectsModule } from './projects/projects.module';
import { JourneyModule } from './journey/journey.module';
import { DocumentsModule } from './documents/documents.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ProgressModule } from './progress/progress.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { NotificationsModule } from './notifications/notifications.module';
import { VersionsModule } from './versions/versions.module';
import { BmcModule } from './bmc/bmc.module';
import { SharesModule } from './shares/shares.module';
import { ExportsModule } from './exports/exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    IncubatorsModule, IncubatorMembersModule, IncubatorDocumentsModule,
    AuthModule, UsersModule, ProfilesModule, ProjectOwnerModule, ExpertModule,
    UploadsModule, ProjectsModule, JourneyModule, DocumentsModule,
    ReviewsModule, ProgressModule, AiAssistantModule, NotificationsModule,
    VersionsModule, BmcModule, SharesModule, ExportsModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule { }
