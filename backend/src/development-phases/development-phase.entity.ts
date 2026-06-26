import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('development_phases')
export class DevelopmentPhase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: 0 })
  order_index: number; // pour afficher dans l'ordre voulu dans le select

  @CreateDateColumn()
  created_at: Date;
}