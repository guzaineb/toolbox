import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('project_shares')
export class ProjectShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ unique: true })
  share_token: string;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  permissions: {
    can_view_bmc?: boolean;
    can_view_business_plan?: boolean;
    can_view_documents?: boolean;
    can_comment?: boolean;
  };

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
