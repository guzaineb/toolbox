import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('bmc_snapshots')
export class BmcSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'uuid', nullable: true })
  version_id: string;

  @Column({ type: 'jsonb' })
  blocks: {
    customer_segments: string;
    value_proposition: string;
    channels: string;
    customer_relations: string;
    revenue_streams: string;
    key_resources: string;
    key_activities: string;
    key_partners: string;
    cost_structure: string;
    environmental_impact?: string;
    social_impact?: string;
    circular_economy?: string;
    sdg_goals?: string;
  };

  @Column({ type: 'boolean', default: false })
  is_green: boolean;

  @Column({ type: 'boolean', default: false })
  is_auto_generated: boolean;

  @CreateDateColumn()
  created_at: Date;
}
