import { DataSource } from 'typeorm';
import { seedExpertiseAreas } from './expertise-area.seed';
import { AppDataSource } from '../data-source';
import { seedUsers } from './users.seed';
import { seedSectors } from './sector.seed';
import { seedDevelopmentPhases } from './development-phase.seed';

async function runSeeds() {
  try {
    const dataSource: DataSource = await AppDataSource.initialize();

    console.log('🌱 Seeding started...');

    await seedExpertiseAreas(dataSource);
    await seedSectors(dataSource);
    await seedDevelopmentPhases(dataSource);
    await seedUsers(dataSource);

    console.log('✅ Seeding finished!');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

runSeeds();