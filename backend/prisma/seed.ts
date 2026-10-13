import { PrismaClient } from '@prisma/client';
import { seedStepTemplates, seedDemoProject } from './seeds/step-templates.seed';
import { seedDemoScenario } from './seeds/demo-scenario.seed';
import { seedDemoExperts } from './seeds/demo-experts.seed';

const prisma = new PrismaClient();

async function seedNotificationPreferences() {
  console.log('\n📦 Step 4/5: Seed notification preferences for all users');

  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  let created = 0;
  for (const user of users) {
    const existing = await prisma.notificationPreference.findUnique({
      where: { user_id: user.id },
    });
    if (!existing) {
      await prisma.notificationPreference.create({
        data: { user_id: user.id },
      });
      created++;
    }
  }

  console.log(`  ✅ ${created} preferences created (${users.length - created} already exist)`);
}

async function main() {
  console.log('\n🌱 Prisma Seed — ProjectStruct Sprint 2');
  console.log('========================================\n');

  console.log('📦 Step 1/5: Seed demo scenario (users, cohorts, projects, coaching, evaluations)');
  await seedDemoScenario(prisma);

  console.log('\n📦 Step 2/5: Create demo project (if none exists)');
  await seedDemoProject(prisma);

  console.log('\n📦 Step 3/5: Initialize step_progress templates');
  await seedStepTemplates(prisma);

  await seedNotificationPreferences();

  // Step 5: Demo experts & projects (only if DEMO_EXPERTS=true or --experts flag)
  const includeDemoExperts = process.env.DEMO_EXPERTS === 'true' || process.argv.includes('--experts');
  if (includeDemoExperts) {
    console.log('\n📦 Step 5/5: Seed demo experts & projects');
    await seedDemoExperts();
  } else {
    console.log('\n📦 Step 5/5: Demo experts & projects skipped (set DEMO_EXPERTS=true or pass --experts)');
  }

  console.log('\n📦 Verify');
  const projectCount = await prisma.project.count();
  const stepCount = await prisma.stepProgress.count();
  const prefCount = await prisma.notificationPreference.count();
  console.log(`  ✅ Projects: ${projectCount}`);
  console.log(`  ✅ Step progress entries: ${stepCount}`);
  console.log(`  ✅ Notification preferences: ${prefCount}`);

  console.log('\n========================================');
  console.log('✅ Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
