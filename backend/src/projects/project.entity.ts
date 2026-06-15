import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { ProjectStep } from '../journey/project-step.entity';
import { ProjectDocument } from '../documents/project-document.entity';
import { Review } from '../reviews/review.entity';
import { ProgressHistory } from '../progress/progress-history.entity';
import { Notification } from '../notifications/notification.entity';

export enum ProjectStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ProjectStep, step => step.project, { cascade: true })
  steps: ProjectStep[];

  @OneToMany(() => ProjectDocument, doc => doc.project, { cascade: true })
  documents: ProjectDocument[];

  @OneToMany(() => Review, review => review.project, { cascade: true })
  reviews: Review[];

  @OneToMany(() => ProgressHistory, history => history.project, { cascade: true })
  progressHistory: ProgressHistory[];

  @OneToMany(() => Notification, notif => notif.project, { cascade: true })
  notifications: Notification[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
