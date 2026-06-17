import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Entity('project_versions')
export class ProjectVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column()
  version_number: string;

  @Column({ type: 'text', nullable: true })
  label: string;

  @Column({ type: 'jsonb', nullable: true })
  snapshot: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changelog: { field: string; old: any; new: any }[];

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'boolean', default: false })
  is_current: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  author: User;
}
