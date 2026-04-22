import { DataSource } from 'typeorm';
import { ExpertiseArea } from '../expert/expertise-area.entity';
import { User } from '../users/user.entity';
import { ExpertProfile } from '../expert/expert-profile.entity';
import { ProjectOwnerProfile } from '../project-owner/project-owner-profile.entity';
import { IncubatorDocument } from '../incubator-documents/incubator-document.entity';
import { IncubatorMember } from '../incubator-members/incubator-member.entity';
import { Incubator } from '../incubators/incubator.entity';
import { UserProfile } from '../profiles/user-profile.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'db-tool',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: true, 
});