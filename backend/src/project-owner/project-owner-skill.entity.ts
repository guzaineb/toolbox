import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ProjectOwnerProfile } from './project-owner-profile.entity';

@Entity('project_owner_skills')
export class ProjectOwnerSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  skill_name: string;

  @Column({ nullable: true })
  level: string;

  @ManyToOne(() => ProjectOwnerProfile, profile => profile.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_owner_profile_id' })
  profile: ProjectOwnerProfile;

  @CreateDateColumn()
  created_at: Date;
}
