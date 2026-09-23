import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Incubator } from '../incubators/incubator.entity';
import { User } from 'src/users/user.entity';

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
 @Column({ nullable: true, type: 'text' })
  rejection_reason: string | null;
@ManyToOne(() => User)
@JoinColumn({ name: 'uploaded_by_user_id' })
uploaded_by_user: User;

  @CreateDateColumn()
  uploaded_at: Date;

  @ManyToOne(() => Incubator, incubator => incubator.documents)
  @JoinColumn({ name: 'incubator_id' })
  incubator: Incubator;
}