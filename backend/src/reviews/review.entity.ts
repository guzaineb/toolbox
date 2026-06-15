import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  project_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  step_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  document_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', nullable: true })
  innovation_score: number | null;

  @Column({ type: 'int', nullable: true })
  faisability_score: number | null;

  @Column({ type: 'int', nullable: true })
  market_score: number | null;

  @Column({ type: 'int', nullable: true })
  team_score: number | null;

  @Column({ type: 'int', nullable: true })
  business_model_score: number | null;

  @ManyToOne(() => Project, project => project.reviews)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
