import * as bcrypt from 'bcrypt';
import { Client } from 'pg';

async function main() {
  console.log('\n👤 User Seed — Démo ProjectStruct');
  console.log('===================================\n');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'db-toolbox',
  });

  await client.connect();
  console.log('✅ Database connected\n');

  const passwordHash = await bcrypt.hash('password123', 10);

  async function upsertUser(email: string, role: string) {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log(`  ⏩ ${email} existe déjà`);
      return existing.rows[0].id;
    }
    return null;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. ADMIN
  // ───────────────────────────────────────────────────────────────────────────
  let userId = await upsertUser('admin@toolbox.com', 'admin');
  if (!userId) {
    const profile = await client.query(
      `INSERT INTO user_profiles (id, first_name, last_name, bio, preferred_language)
       VALUES (gen_random_uuid(), 'Admin', 'ToolBox', 'Administrateur de la plateforme ToolBox', 'fr')
       RETURNING id`,
    );
    const user = await client.query(
      `INSERT INTO users (id, email, password_hash, role, is_verified, is_active, profile_id)
       VALUES (gen_random_uuid(), 'admin@toolbox.com', $1, 'admin', true, true, $2)
       RETURNING id`,
      [passwordHash, profile.rows[0].id],
    );
    userId = user.rows[0].id;
    console.log('  ✅ Admin: admin@toolbox.com');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. EXPERT
  // ───────────────────────────────────────────────────────────────────────────
  userId = await upsertUser('expert@toolbox.com', 'expert');
  if (!userId) {
    const profile = await client.query(
      `INSERT INTO user_profiles (id, first_name, last_name, bio, preferred_language)
       VALUES (gen_random_uuid(), 'Sophie', 'Martin', 'Experte en éco-conception et innovation durable avec 15 ans d''expérience.', 'fr')
       RETURNING id`,
    );
    const user = await client.query(
      `INSERT INTO users (id, email, password_hash, role, is_verified, is_active, profile_id)
       VALUES (gen_random_uuid(), 'expert@toolbox.com', $1, 'expert', true, true, $2)
       RETURNING id`,
      [passwordHash, profile.rows[0].id],
    );
    userId = user.rows[0].id;
    await client.query(
      `INSERT INTO expert_profiles (id, headline, bio, organization, position, years_of_experience, availability_status, user_id)
       VALUES (gen_random_uuid(), 'Experte en éco-conception et financement vert', 'J''accompagne les entrepreneurs verts dans la structuration de leur modèle d''affaires.', 'Green Innovation Lab', 'Senior Advisor', 15, 'available', $1)`,
      [userId],
    );
    console.log('  ✅ Expert: expert@toolbox.com');
  }

  // Expertise areas
  const expertiseAreas = [
    { name: 'Éco-conception', category: 'Environnement' },
    { name: 'Financement vert', category: 'Finance' },
    { name: "Modèle d'affaires", category: 'Stratégie' },
    { name: 'Marketing durable', category: 'Marketing' },
    { name: 'Impact social', category: 'Social' },
  ];
  for (const area of expertiseAreas) {
    const exists = await client.query('SELECT id FROM expertise_areas WHERE name = $1', [area.name]);
    if (exists.rows.length === 0) {
      await client.query(
        'INSERT INTO expertise_areas (id, name, category) VALUES (gen_random_uuid(), $1, $2)',
        [area.name, area.category],
      );
    }
  }
  console.log('  ✅ 5 expertise areas créées');

  // ───────────────────────────────────────────────────────────────────────────
  // 3. PROJECT OWNER
  // ───────────────────────────────────────────────────────────────────────────
  userId = await upsertUser('porteur@toolbox.com', 'project_owner');
  if (!userId) {
    const profile = await client.query(
      `INSERT INTO user_profiles (id, first_name, last_name, bio, preferred_language, country, city)
       VALUES (gen_random_uuid(), 'Thomas', 'Dubois', 'Entrepreneur vert spécialisé dans les solutions d''emballage compostable.', 'fr', 'France', 'Lyon')
       RETURNING id`,
    );
    const user = await client.query(
      `INSERT INTO users (id, email, password_hash, role, is_verified, is_active, profile_id)
       VALUES (gen_random_uuid(), 'porteur@toolbox.com', $1, 'project_owner', true, true, $2)
       RETURNING id`,
      [passwordHash, profile.rows[0].id],
    );
    userId = user.rows[0].id;
    const poProfile = await client.query(
      `INSERT INTO project_owner_profiles (id, current_status, education_level, field_of_study, occupation, entrepreneurial_experience_level, has_previous_startup, linkedin_url, user_id)
       VALUES (gen_random_uuid(), 'entrepreneur', 'bac+5', 'Ingénierie environnementale', 'Fondateur', 2, true, 'https://linkedin.com/in/thomasdubois', $1)
       RETURNING id`,
      [userId],
    );
    const poProfileId = poProfile.rows[0].id;
    // Skills
    for (const s of [{ name: 'Gestion de projet', level: 'advanced' }, { name: 'Éco-conception', level: 'intermediate' }, { name: 'Business Model Canvas', level: 'advanced' }]) {
      await client.query(
        'INSERT INTO project_owner_skills (id, skill_name, level, project_owner_profile_id) VALUES (gen_random_uuid(), $1, $2, $3)',
        [s.name, s.level, poProfileId],
      );
    }
    // Experiences
    await client.query(
      `INSERT INTO project_owner_experiences (id, title, organization, description, start_date, project_owner_profile_id)
       VALUES (gen_random_uuid(), 'Fondateur', 'Éco-Emballages Vert', 'Création startup emballages compostables', '2023-01-01', $1)`,
      [poProfileId],
    );
    await client.query(
      `INSERT INTO project_owner_experiences (id, title, organization, description, start_date, end_date, project_owner_profile_id)
       VALUES (gen_random_uuid(), 'Chef de projet R&D', 'GreenPack Solutions', 'Développement matériaux biodégradables', '2019-03-01', '2022-12-31', $1)`,
      [poProfileId],
    );
    console.log('  ✅ Porteur de projet: porteur@toolbox.com (avec skills + expériences)');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. INCUBATOR MEMBER
  // ───────────────────────────────────────────────────────────────────────────
  userId = await upsertUser('incubateur@toolbox.com', 'incubator_membre');
  if (!userId) {
    const profile = await client.query(
      `INSERT INTO user_profiles (id, first_name, last_name, bio, preferred_language, country, city)
       VALUES (gen_random_uuid(), 'Claire', 'Moreau', 'Responsable de programme d''incubation pour startups vertes.', 'fr', 'France', 'Paris')
       RETURNING id`,
    );
    const user = await client.query(
      `INSERT INTO users (id, email, password_hash, role, is_verified, is_active, profile_id)
       VALUES (gen_random_uuid(), 'incubateur@toolbox.com', $1, 'incubator_membre', true, true, $2)
       RETURNING id`,
      [passwordHash, profile.rows[0].id],
    );
    userId = user.rows[0].id;
    console.log('  ✅ Incubateur: incubateur@toolbox.com');
  }

  // Incubator
  const incResult = await client.query("SELECT id FROM incubators WHERE slug = 'green-incubator'");
  let incubatorId = incResult.rows[0]?.id;
  if (!incubatorId) {
    const adminUser = await client.query("SELECT id FROM users WHERE email = 'admin@toolbox.com'");
    const creatorId = adminUser.rows[0]?.id || '00000000-0000-0000-0000-000000000000';
    const incubator = await client.query(
      `INSERT INTO incubators (id, name, slug, description, email, country, city, verification_status, status, created_by_user_id)
       VALUES (gen_random_uuid(), 'Green Incubator', 'green-incubator', 'Incubateur dédié aux startups de l''économie verte et circulaire', 'contact@greenincubator.com', 'France', 'Paris', 'approved', 'active', $1)
       RETURNING id`,
      [creatorId],
    );
    incubatorId = incubator.rows[0].id;
    console.log('  ✅ Green Incubator créé');
  }

  // Membership
  const incUser = await client.query("SELECT id FROM users WHERE email = 'incubateur@toolbox.com'");
  if (incUser.rows[0] && incubatorId) {
    const membershipExists = await client.query(
      'SELECT id FROM incubator_members WHERE user_id = $1 AND incubator_id = $2',
      [incUser.rows[0].id, incubatorId],
    );
    if (membershipExists.rows.length === 0) {
      await client.query(
        `INSERT INTO incubator_members (id, user_id, incubator_id, role, job_title, status, is_primary_contact)
         VALUES (gen_random_uuid(), $1, $2, 'admin', 'Responsable de programme', 'active', true)`,
        [incUser.rows[0].id, incubatorId],
      );
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
  console.log('   │ Admin               │ admin@toolbox.com            │ password123   │');
  console.log('   │ Expert              │ expert@toolbox.com           │ password123   │');
  console.log('   │ Porteur de projet   │ porteur@toolbox.com          │ password123   │');
  console.log('   │ Incubateur          │ incubateur@toolbox.com       │ password123   │');
  console.log('   └─────────────────────┴──────────────────────────────┴───────────────┘\n');

  await client.end();
}

main().catch((e) => {
  console.error('❌ User seed failed:', e);
  process.exit(1);
});
