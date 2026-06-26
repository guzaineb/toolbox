import { DevelopmentPhase } from '@/development-phases/development-phase.entity';
import { DataSource } from 'typeorm';

export const developmentPhasesSeed = [
  { name: 'Idéation', description: 'Recherche de problème/solution, brainstorming', order_index: 0 },
  { name: 'Prototype / MVP', description: 'Première version fonctionnelle (Produit Minimum Viable)', order_index: 1 },
  { name: 'Product-Market Fit', description: 'Validation de l’adéquation produit/marché', order_index: 2 },
  { name: 'Early Traction', description: 'Premiers clients / utilisateurs, génération de revenus', order_index: 3 },
  { name: 'Scaling', description: 'Croissance rapide, commercialisation à grande échelle', order_index: 4 },
  { name: 'Maturité / Expansion', description: 'Entreprise établie, diversification', order_index: 5 },
];

export async function seedDevelopmentPhases(dataSource: DataSource) {
  const repo = dataSource.getRepository(DevelopmentPhase);
  for (const item of developmentPhasesSeed) {
    const exists = await repo.findOne({ where: { name: item.name } });
    if (!exists) {
      await repo.save(repo.create(item));
    }
  }
  console.log(`✅ Development phases seeded: ${developmentPhasesSeed.length} items`);
}