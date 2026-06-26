import { Sector } from '@/sectors/sector.entity';
import { DataSource } from 'typeorm';

export const sectorsSeed = [
  { name: 'Technologie & Digital', description: 'SaaS, logiciels, IA, blockchain, etc.' },
  { name: 'Santé & Biotech', description: 'MedTech, biotechnologies, santé numérique' },
  { name: 'Fintech & Assurance', description: 'Services financiers, paiements, crypto' },
  { name: 'AgriTech & Alimentation', description: 'Agriculture durable, foodtech' },
  { name: 'E-commerce & Retail', description: 'Vente en ligne, marketplaces' },
  { name: 'Éducation (EdTech)', description: 'Formation, e-learning, éducation' },
  { name: 'Énergie & Cleantech', description: 'Énergies renouvelables, efficacité énergétique' },
  { name: 'Immobilier (PropTech)', description: 'Immobilier, construction, smart building' },
  { name: 'Logistique & Mobilité', description: 'Transport, supply chain, véhicules autonomes' },
  { name: 'Médias & Divertissement', description: 'Streaming, jeux vidéo, content creation' },
  { name: 'Industrie & Manufacturing', description: 'Industrie 4.0, automatisation' },
  { name: 'Impact Social & Environnement', description: 'Économie sociale et solidaire, RSE' },
  { name: 'Autre', description: 'Secteur non listé' },
];

export async function seedSectors(dataSource: DataSource) {
  const repo = dataSource.getRepository(Sector);
  for (const item of sectorsSeed) {
    const exists = await repo.findOne({ where: { name: item.name } });
    if (!exists) {
      await repo.save(repo.create(item));
    }
  }
  console.log(`✅ Sectors seeded: ${sectorsSeed.length} items`);
}