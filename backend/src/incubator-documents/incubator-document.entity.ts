import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Incubator } from '../incubators/incubator.entity';

@Entity('incubator_documents')
export class IncubatorDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  incubator_id: string;

  @Column()
  document_type: string; // 'commerce_register', 'legal_doc', 'tax_certificate', 'institutional_proof'

  @Column()
  file_url: string;

  @Column({ default: 'pending' })
  verification_status: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'uuid' })
  uploaded_by_user_id: string;

  @CreateDateColumn()
  uploaded_at: Date;

  @ManyToOne(() => Incubator, incubator => incubator.documents)
  @JoinColumn({ name: 'incubator_id' })
  incubator: Incubator;
}