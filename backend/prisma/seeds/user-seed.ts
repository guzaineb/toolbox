import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n👤 User Seed — Démo ProjectStruct');
  console.log('===================================\n');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. ADMIN
  // ───────────────────────────────────────────────────────────────────────────
  let user = await prisma.user.findUnique({ where: { email: 'admin@toolbox.com' } });
  if (!user) {
    const profile = await prisma.userProfile.create({
      data: {
        first_name: 'Admin',
        last_name: 'ToolBox',
        bio: 'Administrateur de la plateforme ToolBox',
        preferred_language: 'FR',
      },
    });
    user = await prisma.user.create({
      data: {
        email: 'admin@toolbox.com',
        password_hash: passwordHash,
        role: 'ADMIN',
        is_verified: true,
        is_active: true,
        profile_id: profile.id,
      },
    });
    console.log('  ✅ Admin: admin@toolbox.com');
  } else {
    console.log('  ⏩ admin@toolbox.com existe déjà');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. EXPERT
  // ───────────────────────────────────────────────────────────────────────────
  user = await prisma.user.findUnique({ where: { email: 'expert@toolbox.com' } });
  if (!user) {
    const profile = await prisma.userProfile.create({
      data: {
        first_name: 'Sophie',
        last_name: 'Martin',
        bio: "Experte en éco-conception et innovation durable avec 15 ans d'expérience.",
        preferred_language: 'FR',
      },
    });
    user = await prisma.user.create({
      data: {
        email: 'expert@toolbox.com',
        password_hash: passwordHash,
        role: 'EXPERT',
        is_verified: true,
        is_active: true,
        profile_id: profile.id,
      },
    });
    await prisma.expertProfile.create({
      data: {
        user_id: user.id,
        headline: 'Experte en éco-conception et financement vert',
        bio: "J'accompagne les entrepreneurs verts dans la structuration de leur modèle d'affaires.",
        organization: 'Green Innovation Lab',
        position: 'Senior Advisor',
        years_of_experience: 15,
        availability_status: 'AVAILABLE',
      },
    });
    console.log('  ✅ Expert: expert@toolbox.com');
  } else {
    console.log('  ⏩ expert@toolbox.com existe déjà');
  }

  // Expertise areas
  const expertiseAreas = [
    { name: 'Développement Web', category: 'Tech & Digital' },
    { name: 'Développement Mobile', category: 'Tech & Digital' },
    { name: 'Intelligence Artificielle', category: 'Tech & Digital' },
    { name: 'Data Science', category: 'Tech & Digital' },
    { name: 'Cybersécurité', category: 'Tech & Digital' },
    { name: 'Cloud & DevOps', category: 'Tech & Digital' },
    { name: 'Blockchain', category: 'Tech & Digital' },
    { name: 'IoT', category: 'Tech & Digital' },
    { name: 'Business Model', category: 'Business & Stratégie' },
    { name: 'Stratégie Go-to-Market', category: 'Business & Stratégie' },
    { name: 'Fundraising & Investissement', category: 'Business & Stratégie' },
    { name: 'Finance & Comptabilité', category: 'Business & Stratégie' },
    { name: 'Lean Startup', category: 'Business & Stratégie' },
    { name: 'M&A / Fusion-Acquisition', category: 'Business & Stratégie' },
    { name: 'Marketing Digital', category: 'Marketing & Ventes' },
    { name: 'Growth Hacking', category: 'Marketing & Ventes' },
    { name: 'Branding & Communication', category: 'Marketing & Ventes' },
    { name: 'Ventes B2B', category: 'Marketing & Ventes' },
    { name: 'SEO / SEA', category: 'Marketing & Ventes' },
    { name: 'Product Marketing', category: 'Marketing & Ventes' },
    { name: 'Leadership & Management', category: 'RH & Leadership' },
    { name: 'Recrutement & Talent', category: 'RH & Leadership' },
    { name: "Culture d'entreprise", category: 'RH & Leadership' },
    { name: 'Coaching & Mentoring', category: 'RH & Leadership' },
    { name: 'Product Management', category: 'Produit & Design' },
    { name: 'UX / UI Design', category: 'Produit & Design' },
    { name: 'Design Thinking', category: 'Produit & Design' },
    { name: 'Droit des Startups', category: 'Droit & Réglementation' },
    { name: 'Propriété intellectuelle', category: 'Droit & Réglementation' },
    { name: 'RGPD & Conformité', category: 'Droit & Réglementation' },
    { name: 'Impact Social', category: 'Impact & Sectoriel' },
    { name: 'Développement Durable', category: 'Impact & Sectoriel' },
    { name: 'Agri-Tech', category: 'Impact & Sectoriel' },
    { name: 'Med-Tech / Santé', category: 'Impact & Sectoriel' },
    { name: 'Ed-Tech', category: 'Impact & Sectoriel' },
    { name: 'Fintech', category: 'Impact & Sectoriel' },
  ];

  for (const area of expertiseAreas) {
    const exists = await prisma.expertiseArea.findFirst({ where: { name: area.name } });
    if (!exists) {
      await prisma.expertiseArea.create({ data: { name: area.name, category: area.category } });
    }
  }
  console.log('  ✅ expertise areas créées');

  // ───────────────────────────────────────────────────────────────────────────
  // 3. PROJECT OWNER
  // ───────────────────────────────────────────────────────────────────────────
  user = await prisma.user.findUnique({ where: { email: 'porteur@toolbox.com' } });
  if (!user) {
    const profile = await prisma.userProfile.create({
      data: {
        first_name: 'Thomas',
        last_name: 'Dubois',
        bio: "Entrepreneur vert spécialisé dans les solutions d'emballage compostable.",
        preferred_language: 'FR',
        country: 'France',
        city: 'Lyon',
      },
    });
    user = await prisma.user.create({
      data: {
        email: 'porteur@toolbox.com',
        password_hash: passwordHash,
        role: 'PROJECT_OWNER',
        is_verified: true,
        is_active: true,
        profile_id: profile.id,
      },
    });
    const poProfile = await prisma.projectOwnerProfile.create({
      data: {
        user_id: user.id,
        current_status: 'entrepreneur',
        education_level: 'bac+5',
        field_of_study: 'Ingénierie environnementale',
        occupation: 'Fondateur',
        entrepreneurial_experience_level: 2,
        has_previous_startup: true,
        linkedin_url: 'https://linkedin.com/in/thomasdubois',
      },
    });
    // Skills
    for (const s of [{ name: 'Gestion de projet', level: 'advanced' }, { name: 'Éco-conception', level: 'intermediate' }, { name: 'Business Model Canvas', level: 'advanced' }]) {
      await prisma.projectOwnerSkill.create({
        data: {
          skill_name: s.name,
          level: s.level,
          project_owner_profile_id: poProfile.id,
        },
      });
    }
    // Experiences
    await prisma.projectOwnerExperience.create({
      data: {
        title: 'Fondateur',
        organization: 'Éco-Emballages Vert',
        description: 'Création startup emballages compostables',
        start_date: '2023-01-01T00:00:00.000Z',
        project_owner_profile_id: poProfile.id,
      },
    });
    await prisma.projectOwnerExperience.create({
      data: {
        title: 'Chef de projet R&D',
        organization: 'GreenPack Solutions',
        description: 'Développement matériaux biodégradables',
        start_date: '2019-03-01T00:00:00.000Z',
        end_date: '2022-12-31T00:00:00.000Z',
        project_owner_profile_id: poProfile.id,
      },
    });
    console.log('  ✅ Porteur de projet: porteur@toolbox.com (avec skills + expériences)');
  } else {
    console.log('  ⏩ porteur@toolbox.com existe déjà');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. INCUBATOR MEMBER
  // ───────────────────────────────────────────────────────────────────────────
  user = await prisma.user.findUnique({ where: { email: 'incubateur@toolbox.com' } });
  if (!user) {
    const profile = await prisma.userProfile.create({
      data: {
        first_name: 'Claire',
        last_name: 'Moreau',
        bio: "Responsable de programme d'incubation pour startups vertes.",
        preferred_language: 'FR',
        country: 'France',
        city: 'Paris',
      },
    });
    user = await prisma.user.create({
      data: {
        email: 'incubateur@toolbox.com',
        password_hash: passwordHash,
        role: 'INCUBATOR_MEMBER',
        is_verified: true,
        is_active: true,
        profile_id: profile.id,
      },
    });
    console.log('  ✅ Incubateur: incubateur@toolbox.com');
  } else {
    console.log('  ⏩ incubateur@toolbox.com existe déjà');
  }

  // Incubator
  let incubator = await prisma.incubator.findUnique({ where: { slug: 'green-incubator' } });
  if (!incubator) {
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@toolbox.com' } });
    const creatorId = adminUser?.id || '00000000-0000-0000-0000-000000000000';
    incubator = await prisma.incubator.create({
      data: {
        name: 'Green Incubator',
        slug: 'green-incubator',
        description: "Incubateur dédié aux startups de l'économie verte et circulaire",
        email: 'contact@greenincubator.com',
        country: 'France',
        city: 'Paris',
        verification_status: 'APPROVED',
        status: 'ACTIVE',
        created_by_user_id: creatorId,
      },
    });
    console.log('  ✅ Green Incubator créé');
  } else {
    console.log('  ⏩ Green Incubator existe déjà');
  }

  // Membership
  const incUser = await prisma.user.findUnique({ where: { email: 'incubateur@toolbox.com' } });
  if (incUser && incubator) {
    const membershipExists = await prisma.incubatorMember.findUnique({
      where: { user_id_incubator_id: { user_id: incUser.id, incubator_id: incubator.id } },
    });
    if (!membershipExists) {
      await prisma.incubatorMember.create({
        data: {
          user_id: incUser.id,
          incubator_id: incubator.id,
          role: 'ADMIN',
          job_title: 'Responsable de programme',
          status: 'ACTIVE',
          is_primary_contact: true,
        },
      });
      console.log('  ✅ Incubator membership créée');
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n===================================');
  console.log('✅ User seed completed!\n');
  console.log('📋 Connexions de démonstration :');
  console.log('   ┌─────────────────────┬──────────────────────────────┬───────────────┐');
  console.log('   │ Rôle                │ Email                        │ Mot de passe  │');
  console.log('   ├─────────────────────┼──────────────────────────────┼───────────────┤');
  console.log('   │ Admin               │ admin@exemple.com            │ Admin123!     │');
  console.log('   │ Expert              │ expert@exemple.com           │ Expert1234!   │');
  console.log('   │ Porteur de projet   │ porteur@exemple.com          │ Porteur123!   │');
  console.log('   │ Incubateur          │ incubateur@exemple.com       │ Incubateur123!   │');
  console.log('   └─────────────────────┴──────────────────────────────┴───────────────┘\n');
}

main()
  .catch((e) => {
    console.error('❌ User seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
