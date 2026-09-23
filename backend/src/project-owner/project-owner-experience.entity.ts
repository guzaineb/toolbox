import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ProjectOwnerProfile } from './project-owner-profile.entity';

@Entity('project_owner_experiences')
export class ProjectOwnerExperience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  organization: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'date' })
  start_date: string;

  @Column({ nullable: true, type: 'date' })
  end_date: string;

  @ManyToOne(() => ProjectOwnerProfile, profile => profile.experiences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_owner_profile_id' })
  profile: ProjectOwnerProfile;

  @CreateDateColumn()
  created_at: Date;
}
