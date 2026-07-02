import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Incubator } from '../incubators/incubator.entity';

@Entity('incubator_invitations')
export class IncubatorInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'uuid' })
  incubator_id: string;

  @Column()
  email: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  job_title: string;

  @Column()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Incubator)
  @JoinColumn({ name: 'incubator_id' })
  incubator: Incubator;
}