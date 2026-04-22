import {
  Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ProjectOwnerSkill } from './project-owner-skill.entity';
import { ProjectOwnerExperience } from './project-owner-experience.entity';

@Entity('project_owner_profiles')
export class ProjectOwnerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  current_status: string;

  @Column({ nullable: true })
  education_level: string;

  @Column({ nullable: true })
  field_of_study: string;

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  linkedin_url: string;

  @Column({ default: 0 })
  entrepreneurial_experience_level: number;

  @Column({ default: false })
  has_previous_startup: boolean;

  @OneToOne(() => User, user => user.projectOwnerProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ProjectOwnerSkill, skill => skill.profile, { cascade: true })
  skills: ProjectOwnerSkill[];

  @OneToMany(() => ProjectOwnerExperience, exp => exp.profile, { cascade: true })
  experiences: ProjectOwnerExperience[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
