import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Entity('progress_history')
export class ProgressHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  project_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  step_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  action: string | null;

  @Column({ type: 'varchar', nullable: true })
  previous_status: string | null;

  @Column({ type: 'varchar', nullable: true })
  new_status: string | null;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @ManyToOne(() => Project, project => project.progressHistory)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
