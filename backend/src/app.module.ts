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
    IncubatorsModule, IncubatorMembersModule, IncubatorDocumentsModule, AuthModule, UsersModule, ProfilesModule, ProjectOwnerModule, ExpertModule,UploadsModule],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule { }
