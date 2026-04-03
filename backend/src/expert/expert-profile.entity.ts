import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';
import { ExpertiseArea } from './expertise-area.entity';

@Entity('expert_profiles')
export class ExpertProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  headline: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  organization: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  years_of_experience: number;

  @Column({ nullable: true })
  linkedin_url: string;

  @Column({ default: 'available' })
  availability_status: string;

  @OneToOne(() => User, user => user.expertProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => ExpertiseArea)
  @JoinTable({ name: 'expert_profile_expertise_areas' })
  expertiseAreas: ExpertiseArea[];
}