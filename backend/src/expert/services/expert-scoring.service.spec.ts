import { ExpertScoringService } from './expert-scoring.service';
import { ProjectMatch } from '../interfaces/match-details.interface';

describe('ExpertScoringService', () => {
  let service: ExpertScoringService;

  beforeEach(() => {
    service = new ExpertScoringService();
  });

  it('évite le score NaN quand aucun domaine requis nest détecté', () => {
    const match = service.matchWithProject(
      { years_of_experience: 5, availability_status: 'AVAILABLE' },
      [],
      { requiredAreas: [], minYearsExperience: 2 },
    );

    expect(match.details.skillsMatch.score).toBe(0);
    expect(match.details.skillsMatch.matched).toBe(0);
    expect(Number.isNaN(match.matchPercentage)).toBe(false);
  });

  it('score les compétences, lexpérience et le bonus de disponibilité', () => {
    const expertises = [
      { expertiseArea: { id: 'a1' } },
      { expertiseArea: { id: 'a2' } },
    ];
    const match = service.matchWithProject(
      { years_of_experience: 5, availability_status: 'AVAILABLE' },
      expertises,
      { requiredAreas: ['a1', 'a2'], minYearsExperience: 3 },
    );

    expect(match.matchPercentage).toBe(100);
    expect(match.details.skillsMatch.score).toBe(60);
    expect(match.details.experienceMatch.score).toBe(40);
    expect(match.details.availabilityBonus).toBe(10);
  });

  it('produit une explication reflétant un fort alignement', () => {
    const match: ProjectMatch = {
      matchPercentage: 100,
      details: {
        skillsMatch: { matched: 2, required: 2, score: 60 },
        experienceMatch: { years: 5, required: 3, score: 40 },
        availabilityBonus: 10,
      },
    };

    const explanation = service.buildMatchExplanation(match, {
      years_of_experience: 5,
      availability_status: 'AVAILABLE',
    });

    expect(explanation).toContain(
      'Expertise fortement alignée avec les besoins du projet',
    );
    expect(explanation).toContain("2/2 domaines d'expertise maîtrisés");
    expect(explanation).toContain('disponible immédiatement');
  });
});