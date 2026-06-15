import { DataSource } from 'typeorm';
import { seedExpertiseAreas } from './expertise-area.seed';
import { AppDataSource } from '../data-source';

async function runSeeds() {
  try {
    const dataSource: DataSource = await AppDataSource.initialize();

    console.log('🌱 Seeding started...');

    await seedExpertiseAreas(dataSource);

    console.log('✅ Seeding finished!');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

runSeeds();