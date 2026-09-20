import { PrismaClient, StepStatus } from '@prisma/client';
import { ALL_STEPS } from '../../src/gbm/step-registry';

export const ALL_STEP_KEYS = ALL_STEPS;

export async function seedStepTemplates(prisma: PrismaClient): Promise<void> {
  console.log('  ⏳ Initializing step templates...');

  const projects = await prisma.project.findMany({ select: { id: true, name: true } });
  console.log(`  📋 Found ${projects.length} project(s)`);

  for (const project of projects) {
    console.log(`    → ${project.name} (${project.id.slice(0, 8)}...)`);

    const operations = ALL_STEP_KEYS.map(step =>
      prisma.stepProgress.upsert({
        where: {
          project_id_step_key: {
            project_id: project.id,
            step_key: step.stepKey,
          },
        },
        create: {
          project_id: project.id,
          step_key: step.stepKey,
          status: StepStatus.NOT_STARTED,
        },
        update: {},
      }),
    );

    await prisma.$transaction(operations);
  }

  console.log(`  ✅ Step templates seeded for ${projects.length} project(s)`);
  console.log(`     Total step keys: ${ALL_STEP_KEYS.length}`);
}

export async function seedDemoProject(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.project.count();
  if (existing > 0) {
    console.log('  ⏩ Projects already exist, skipping demo project creation');
    return;
  }

  console.log('  🏗️  Creating demo project...');

  const project = await prisma.project.create({
    data: {
      name: 'Éco-Emballages Vert',
      description: 'Solution d\'emballages compostables à base de déchets agricoles',
      owner_id: '00000000-0000-0000-0000-000000000000',
    },
  });

  const operations = ALL_STEP_KEYS.map(step =>
    prisma.stepProgress.create({
      data: {
        project_id: project.id,
        step_key: step.stepKey,
        status: StepStatus.NOT_STARTED,
      },
    }),
  );

  await prisma.$transaction(operations);

  console.log(`  ✅ Demo project created: ${project.name} (${project.id})`);
}
