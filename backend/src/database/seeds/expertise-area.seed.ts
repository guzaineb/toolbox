import { ExpertiseArea } from '../../expert/expertise-area.entity';
import { DataSource } from 'typeorm';

export const expertiseAreasSeed = [
  // Tech & Digital
  { name: 'Développement Web', category: 'Tech & Digital' },
  { name: 'Développement Mobile', category: 'Tech & Digital' },
  { name: 'Intelligence Artificielle', category: 'Tech & Digital' },
  { name: 'Data Science', category: 'Tech & Digital' },
  { name: 'Cybersécurité', category: 'Tech & Digital' },
  { name: 'Cloud & DevOps', category: 'Tech & Digital' },
  { name: 'Blockchain', category: 'Tech & Digital' },
  { name: 'IoT', category: 'Tech & Digital' },

  // Business & Stratégie
  { name: 'Business Model', category: 'Business & Stratégie' },
  { name: 'Stratégie Go-to-Market', category: 'Business & Stratégie' },
  { name: 'Fundraising & Investissement', category: 'Business & Stratégie' },
  { name: 'Finance & Comptabilité', category: 'Business & Stratégie' },
  { name: 'Lean Startup', category: 'Business & Stratégie' },
  { name: 'M&A / Fusion-Acquisition', category: 'Business & Stratégie' },

  // Marketing & Ventes
  { name: 'Marketing Digital', category: 'Marketing & Ventes' },
  { name: 'Growth Hacking', category: 'Marketing & Ventes' },
  { name: 'Branding & Communication', category: 'Marketing & Ventes' },
  { name: 'Ventes B2B', category: 'Marketing & Ventes' },
  { name: 'SEO / SEA', category: 'Marketing & Ventes' },
  { name: 'Product Marketing', category: 'Marketing & Ventes' },

  // Ressources humaines & Leadership
  { name: 'Leadership & Management', category: 'RH & Leadership' },
  { name: 'Recrutement & Talent', category: 'RH & Leadership' },
  { name: 'Culture d\'entreprise', category: 'RH & Leadership' },
  { name: 'Coaching & Mentoring', category: 'RH & Leadership' },

  // Produit & Design
  { name: 'Product Management', category: 'Produit & Design' },
  { name: 'UX / UI Design', category: 'Produit & Design' },
  { name: 'Design Thinking', category: 'Produit & Design' },

  // Droit & Réglementation
  { name: 'Droit des Startups', category: 'Droit & Réglementation' },
  { name: 'Propriété intellectuelle', category: 'Droit & Réglementation' },
  { name: 'RGPD & Conformité', category: 'Droit & Réglementation' },

  // Impact & Sectoriels
  { name: 'Impact Social', category: 'Impact & Sectoriel' },
  { name: 'Développement Durable', category: 'Impact & Sectoriel' },
  { name: 'Agri-Tech', category: 'Impact & Sectoriel' },
  { name: 'Med-Tech / Santé', category: 'Impact & Sectoriel' },
  { name: 'Ed-Tech', category: 'Impact & Sectoriel' },
  { name: 'Fintech', category: 'Impact & Sectoriel' },
];

export async function seedExpertiseAreas(dataSource: DataSource) {
  const repo = dataSource.getRepository(ExpertiseArea);
  for (const item of expertiseAreasSeed) {
    const exists = await repo.findOne({ where: { name: item.name } });
    if (!exists) {
      await repo.save(repo.create(item));
    }
  }
  console.log(`✅ Expertise areas seeded: ${expertiseAreasSeed.length} items`);
}
