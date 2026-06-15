import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Entity('project_documents')
export class ProjectDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column()
  document_type: string;

  @Column()
  file_url: string;

  @Column({ type: 'uuid', nullable: true })
  step_id: string | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ default: 'pending' })
  verification_status: 'pending' | 'approved' | 'rejected';

  @Column({ nullable: true, type: 'text' })
  rejection_reason?: string | null;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by_user_id: string | null;

  @ManyToOne(() => Project, project => project.documents)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploaded_by: User;

  @CreateDateColumn()
  uploaded_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
