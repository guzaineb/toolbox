import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { ExpertProfile } from './expert-profile.entity';

@Entity('expertise_areas')
export class ExpertiseArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  category: string;

  @ManyToMany(() => ExpertProfile, expert => expert.expertiseAreas)
  experts: ExpertProfile[];
}