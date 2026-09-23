import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IncubatorMember } from '../incubator-members/incubator-member.entity';
import { IncubatorDocument } from '../incubator-documents/incubator-document.entity';

@Entity('incubators')
export class Incubator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  legal_name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  foundation_date: Date;

  @Column({ nullable: true })
  organization_type: string;

  @Column({ nullable: true })
  registration_number: string;

  @Column({ nullable: true })
  tax_id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ default: 'pending' })
  verification_status: 'pending' | 'approved' | 'rejected';

  @Column({ default: 'active' })
  status: 'active' | 'suspended';

  @Column({ type: 'uuid' })
  created_by_user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => IncubatorMember, member => member.incubator)
  members: IncubatorMember[];

  @OneToMany(() => IncubatorDocument, doc => doc.incubator)
  documents: IncubatorDocument[];
}