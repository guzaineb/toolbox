import { DataSource, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@/users/user.entity';
import { UserProfile } from '@/profiles/user-profile.entity';
import { ProjectOwnerProfile } from '@/project-owner/project-owner-profile.entity';
import { ProjectOwnerSkill } from '@/project-owner/project-owner-skill.entity';
import { ProjectOwnerExperience } from '@/project-owner/project-owner-experience.entity';
import { ExpertProfile } from '@/expert/expert-profile.entity';
import { ExpertiseArea } from '@/expert/expertise-area.entity';
import { ExpertProfileExpertiseArea } from '@/expert/expert-profile-expertise-area.entity';
import { Incubator } from '@/incubators/incubator.entity';
import { IncubatorMember } from '@/incubator-members/incubator-member.entity';

/**
 * Seed data for users with different roles.
 */
const usersSeed = [
  {
    email: 'admin@example.com',
    password: 'Admin123!',
    role: UserRole.ADMIN,
    profile: {
      first_name: 'Admin',
      last_name: 'User',
      phone: '+1234567890',
    },
  },
  {
    email: 'projectowner@example.com',
    password: 'Project123!',
    role: UserRole.PROJECT_OWNER,
    profile: {
      first_name: 'Project',
      last_name: 'Owner',
      phone: '+1234567891',
    },
    projectOwner: {
      current_status: 'Looking for co‑founders',
      education_level: 'Master',
      field_of_study: 'Computer Science',
      occupation: 'Software Engineer',
      linkedin_url: 'https://linkedin.com/in/projectowner',
      entrepreneurial_experience_level: 3,
      has_previous_startup: true,
      skills: [
        { skill_name: 'JavaScript', level: 'Advanced' },
        { skill_name: 'Product Management', level: 'Intermediate' },
      ],
      experiences: [
        {
          title: 'Lead Developer',
          organization: 'Tech Startup A',
          description: 'Built MVP for a fintech solution',
          start_date: '2020-01-01',
          end_date: '2022-12-31',
        },
        {
          title: 'Founder',
          organization: 'Side Project B',
          description: 'Launched a small e‑commerce platform',
          start_date: '2019-06-01',
          end_date: '2020-08-31',
        },
      ],
    },
  },
  {
    email: 'expert@example.com',
    password: 'Expert123!',
    role: UserRole.EXPERT,
    profile: {
      first_name: 'Expert',
      last_name: 'User',
      phone: '+1234567892',
    },
    expert: {
      headline: 'Senior AI Consultant',
      bio: '10+ years in machine learning and data science',
      organization: 'AI Solutions Ltd',
      position: 'Lead Data Scientist',
      years_of_experience: 10,
      linkedin_url: 'https://linkedin.com/in/expertuser',
      availability_status: 'available',
      expertiseAreaNames: [
        'Intelligence Artificielle',
        'Data Science',
        'Cloud & DevOps',
      ],
      expertiseLevels: {
        'Intelligence Artificielle': { level: 'expert', years: 8 },
        'Data Science': { level: 'senior', years: 6 },
        'Cloud & DevOps': { level: 'intermediate', years: 4 },
      },
    },
  },
  {
    email: 'incubator@example.com',
    password: 'Incubator123!',
    role: UserRole.INCUBATORMEMBRE,
    profile: {
      first_name: 'Incubator',
      last_name: 'Manager',
      phone: '+1234567893',
    },
    incubatorMember: {
      incubatorSlug: 'startup-accelerator',
      job_title: 'Program Director',
      department: 'Operations',
      bio: 'Experienced startup ecosystem builder',
      role: 'program_manager',
      is_primary_contact: true,
      can_manage_programs: true,
      can_manage_cohorts: true,
      can_manage_members: false,
    },
  },
];

export async function seedUsers(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const profileRepo = dataSource.getRepository(UserProfile);
  const projectOwnerRepo = dataSource.getRepository(ProjectOwnerProfile);
  const skillRepo = dataSource.getRepository(ProjectOwnerSkill);
  const experienceRepo = dataSource.getRepository(ProjectOwnerExperience);
  const expertRepo = dataSource.getRepository(ExpertProfile);
  const expertiseAreaRepo = dataSource.getRepository(ExpertiseArea);
  const expertConnectionRepo = dataSource.getRepository(ExpertProfileExpertiseArea);
  const incubatorRepo = dataSource.getRepository(Incubator);
  const incubatorMemberRepo = dataSource.getRepository(IncubatorMember);

  // Pre‑fetch existing expertise areas
  const expertiseAreas = await expertiseAreaRepo.find();
  const expertiseMap = new Map(expertiseAreas.map(ea => [ea.name, ea]));

  const hashPassword = (plain: string) => bcrypt.hashSync(plain, 10);

  for (const seed of usersSeed) {
    const existing = await userRepo.findOne({ where: { email: seed.email } });
    if (existing) {
      console.log(`⚠️  User ${seed.email} already exists, skipping.`);
      continue;
    }

    // 1. Create UserProfile
    const profile = profileRepo.create({
      first_name: seed.profile.first_name,
      last_name: seed.profile.last_name,
      phone: seed.profile.phone,
    });
    await profileRepo.save(profile);

    // 2. Create User
    const user = userRepo.create({
      email: seed.email,
      password_hash: hashPassword(seed.password),
      role: seed.role,
      is_active: true,
      is_verified: true,
      profile: profile,
    });
    await userRepo.save(user);

    // 3. Role‑specific relations
    if (seed.role === UserRole.PROJECT_OWNER && seed.projectOwner) {
      const poData = seed.projectOwner;
      const projectOwner = projectOwnerRepo.create({
        current_status: poData.current_status,
        education_level: poData.education_level,
        field_of_study: poData.field_of_study,
        occupation: poData.occupation,
        linkedin_url: poData.linkedin_url,
        entrepreneurial_experience_level: poData.entrepreneurial_experience_level,
        has_previous_startup: poData.has_previous_startup,
        user: user,
      });
      await projectOwnerRepo.save(projectOwner);

      // Skills
      for (const skillData of poData.skills) {
        const skill = skillRepo.create({
          skill_name: skillData.skill_name,
          level: skillData.level,
          profile: projectOwner,
        });
        await skillRepo.save(skill);
      }

      // Experiences
      for (const expData of poData.experiences) {
        const exp = experienceRepo.create({
          title: expData.title,
          organization: expData.organization,
          description: expData.description,
          start_date: expData.start_date,
          end_date: expData.end_date,
          profile: projectOwner,
        });
        await experienceRepo.save(exp);
      }

      // Link back to user
      user.projectOwnerProfile = projectOwner;
      await userRepo.save(user);

      console.log(`✅ Project Owner created: ${seed.email}`);
    }

    if (seed.role === UserRole.EXPERT && seed.expert) {
      const expertData = seed.expert;

      const expert = expertRepo.create({
        headline: expertData.headline,
        bio: expertData.bio,
        organization: expertData.organization,
        position: expertData.position,
        years_of_experience: expertData.years_of_experience,
        linkedin_url: expertData.linkedin_url,
        availability_status: expertData.availability_status,
        user: user,
      });
      await expertRepo.save(expert);

      // Connect expertise areas
      for (const areaName of expertData.expertiseAreaNames) {
        const area = expertiseMap.get(areaName);
        if (!area) {
          console.warn(`⚠️  Expertise area "${areaName}" not found, skipping connection for ${seed.email}`);
          continue;
        }

        const levelInfo = expertData.expertiseLevels?.[areaName] || {};
        const connection = expertConnectionRepo.create({
          expertProfile: expert,
          expertiseArea: area,
          level: levelInfo.level || 'intermediate',
          years_of_experience: levelInfo.years || 0,
        });
        await expertConnectionRepo.save(connection);
      }

      user.expertProfile = expert;
      await userRepo.save(user);

      console.log(`✅ Expert created: ${seed.email}`);
    }

    if (seed.role === UserRole.INCUBATORMEMBRE && seed.incubatorMember) {
      const memberData = seed.incubatorMember;

      // Find or create incubator
      let incubator = await incubatorRepo.findOne({
        where: { slug: memberData.incubatorSlug },
      });
      if (!incubator) {
        incubator = incubatorRepo.create({
          name: 'Startup Accelerator',
          slug: memberData.incubatorSlug,
          description: 'A leading startup accelerator program',
          foundation_date: new Date('2018-01-01'),
          organization_type: 'Incubator',
          email: 'contact@accelerator.com',
          phone: '+1234567899',
          website_url: 'https://accelerator.com',
          country: 'France',
          city: 'Paris',
          verification_status: 'approved',
          status: 'active',
          created_by_user_id: user.id,
        });
        await incubatorRepo.save(incubator);
        console.log(`✅ Incubator created: ${incubator.slug}`);
      }

      // Create IncubatorMember using relations (not foreign keys)
      const member = incubatorMemberRepo.create({
        user: user,
        incubator: incubator,
        job_title: memberData.job_title,
        department: memberData.department,
        bio: memberData.bio,
          role: memberData.role as any,
        is_primary_contact: memberData.is_primary_contact || false,
        can_manage_programs: memberData.can_manage_programs || false,
        can_manage_cohorts: memberData.can_manage_cohorts || false,
        can_manage_members: memberData.can_manage_members || false,
        status: 'active',
      });
      await incubatorMemberRepo.save(member);

      console.log(`✅ Incubator member created: ${seed.email}`);
    }

    if (seed.role === UserRole.ADMIN) {
      console.log(`✅ Admin user created: ${seed.email}`);
    }
  }

  console.log('🎉 Seeding users completed.');
}