import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Incubator } from '../incubators/incubator.entity';

@Entity('incubator_members')
@Unique(['user_id', 'incubator_id'])
export class IncubatorMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  incubator_id: string;

  @Column({ default: 'member' })
  role: 'admin' | 'program_manager' | 'cohort_manager' | 'review_manager' | 'member' | 'viewer';

  @Column({ nullable: true })
  job_title: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: 'active' })
  status: 'active' | 'inactive';

  @Column({ default: false })
  is_primary_contact: boolean;

  @Column({ default: false })
  can_manage_programs: boolean;

  @Column({ default: false })
  can_manage_cohorts: boolean;

  @Column({ default: false })
  can_manage_members: boolean;

  @ManyToOne(() => User, user => user.incubatorMembers)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Incubator, incubator => incubator.members)
  @JoinColumn({ name: 'incubator_id' })
  incubator: Incubator;
}