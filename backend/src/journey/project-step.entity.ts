import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/project.entity';

export enum StepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('project_steps')
export class ProjectStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'int' })
  step_number: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  content: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  sub_sections: Record<string, any>;

  @Column({ type: 'enum', enum: StepStatus, default: StepStatus.NOT_STARTED })
  status: StepStatus;

  @Column({ type: 'float', nullable: true })
  score: number | null;

  @Column({ type: 'jsonb', nullable: true })
  validation_errors: string[] | null;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at: Date | null;

  @ManyToOne(() => Project, project => project.steps)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
