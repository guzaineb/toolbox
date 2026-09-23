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
  host: process.env.DB_HOST || 'localhost',          // ← utilise DB_HOST
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',       // ← DB_USER
  password: process.env.DB_PASSWORD || 'admin',      // ← DB_PASSWORD
  database: process.env.DB_NAME || 'db-toolbox',     // ← DB_NAME
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: true,
});