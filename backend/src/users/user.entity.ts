import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { UserProfile } from '../profiles/user-profile.entity';
import { ProjectOwnerProfile } from '../project-owner/project-owner-profile.entity';
import { ExpertProfile } from '../expert/expert-profile.entity';
import { IncubatorMember } from '../incubator-members/incubator-member.entity';

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

  @Column({ nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
  profile: UserProfile;

  @OneToOne(() => ProjectOwnerProfile, po => po.user, { cascade: true })
  projectOwnerProfile: ProjectOwnerProfile;

  @OneToOne(() => ExpertProfile, expert => expert.user, { cascade: true })
  expertProfile: ExpertProfile;

  @OneToMany(() => IncubatorMember, member => member.user)
  incubatorMembers: IncubatorMember[];
}