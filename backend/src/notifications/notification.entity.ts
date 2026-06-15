import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  project_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  type: string | null;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ default: false })
  is_read: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, project => project.notifications)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @CreateDateColumn()
  created_at: Date;
}
