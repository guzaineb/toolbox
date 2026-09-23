import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ExpertProfile } from './expert-profile.entity';
import { ExpertiseArea } from './expertise-area.entity';

@Entity('expert_profile_expertise_areas')
export class ExpertProfileExpertiseArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExpertProfile, profile => profile.expertiseConnections, { onDelete: 'CASCADE',   orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'expert_profile_id' })
  expertProfile: ExpertProfile;

  @ManyToOne(() => ExpertiseArea, { onDelete: 'CASCADE' ,eager: true})
  @JoinColumn({ name: 'expertise_area_id' })
  expertiseArea: ExpertiseArea;

  @Column({ type: 'varchar', length: 20, nullable: true,  })
  level: string; // 'junior' | 'intermediate' | 'senior' | 'expert'

  @Column({ type: 'int', nullable: true, default: 0 })
  years_of_experience: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
  
}