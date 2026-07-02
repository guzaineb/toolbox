import { PrismaClient } from '@prisma/client';
import { seedStepTemplates, seedDemoProject } from './seeds/step-templates.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Prisma Seed — ProjectStruct Sprint 2');
  console.log('========================================\n');

  console.log('📦 Step 1/3: Create demo project (if none exists)');
  await seedDemoProject(prisma);

  console.log('\n📦 Step 2/3: Initialize step_progress templates');
  await seedStepTemplates(prisma);

  console.log('\n📦 Step 3/3: Verify');
  const projectCount = await prisma.project.count();
  const stepCount = await prisma.stepProgress.count();
  console.log(`  ✅ Projects: ${projectCount}`);
  console.log(`  ✅ Step progress entries: ${stepCount}`);

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
