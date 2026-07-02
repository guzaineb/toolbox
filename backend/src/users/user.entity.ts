import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserProfile } from '../profiles/user-profile.entity';
import { ProjectOwnerProfile } from '../project-owner/project-owner-profile.entity';
import { ExpertProfile } from '../expert/expert-profile.entity';
import { IncubatorMember } from '../incubator-members/incubator-member.entity';

export enum UserRole {
  ADMIN = 'admin', EXPERT = 'expert', PROJECT_OWNER = 'project_owner',
  INCUBATORMEMBRE='incubator_membre',

}
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_verified: boolean;

 @Column({ name: 'verification_token', nullable: true, type: 'varchar' })
  verification_token: string | null;
  @Column({ nullable: true, type: 'varchar' })
  verification_code: string  | null;

  @Column({ nullable: true, type: 'timestamp' })
  verification_code_expires: Date | null;
  
  @Column({ nullable: true })
  last_login_at: Date;
  @Column({ nullable: true, name: 'reset_password_token', type: 'varchar' })
resetPasswordToken: string | null;

@Column({ nullable: true, name: 'reset_password_expires', type: 'timestamp' })
resetPasswordExpires: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true,eager: true})
  @JoinColumn({ name: 'profile_id' })
  profile: UserProfile;

  @OneToOne(() => ProjectOwnerProfile, po => po.user, { cascade: true })
 @JoinColumn({ name: 'projectOwnerProfile_id' })
  projectOwnerProfile: ProjectOwnerProfile;

  @OneToOne(() => ExpertProfile, expert => expert.user, { cascade: true })
  @JoinColumn()
  expertProfile: ExpertProfile;

  @OneToMany(() => IncubatorMember, member => member.user)
  incubatorMembers: IncubatorMember[];

@Column({ type: 'enum',  enum: UserRole, nullable: true, default: null })
role: UserRole | null;

}