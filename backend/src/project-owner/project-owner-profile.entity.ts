import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

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
}