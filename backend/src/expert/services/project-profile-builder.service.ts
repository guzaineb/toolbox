import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProjectRequirements {
  /** Identifiants réels des `expertise_areas` requis. */
  requiredAreas: string[];
  /** Noms des domaines retenus (affichage / tests). */
  requiredAreaNames: string[];
  /** Années minimales d'expérience dérivées de la maturité du projet. */
  minYearsExperience: number;
}

/**
 * Construit les exigences réelles d'un projet/campagne à partir des données
 * saisies (idée, synthèse, besoins, évaluation de maturité) au lieu de
 * valeurs codées en dur.
 *
 * Comme la base ne possède pas de lien projet→domaine d'expertise, les
 * domaines requis sont déduits par correspondance de vocabulaire entre le
 * texte du projet et la table `expertise_areas` (nom + catégorie).
 */
@Injectable()
export class ProjectProfileBuilder {
  private readonly MIN_YEARS_BY_PHASE: Record<string, number> = {
    IDEATION: 2,
    VALIDATION: 3,
    EARLY_STAGE: 4,
    GROWTH: 5,
    SCALING: 6,
  };

  constructor(private readonly prisma: PrismaService) {}

  async buildProjectRequirements(projectId: string): Promise<ProjectRequirements> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: this.projectLoadInclude(),
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    return this.deriveProjectRequirements(project);
  }

  /** Dérive les exigences à partir d'une entité projet déjà chargée. */
  async deriveProjectRequirements(project: any): Promise<ProjectRequirements> {
    return this.deriveRequirementsFromText(
      this.extractProjectText(project),
      this.minYearsFor(project?.funding_assessment),
    );
  }

  /** Dérive les exigences (collectif : cohorte) à partir de textes libres. */
  async deriveRequirementsFromText(
    segments: string[],
    minYearsExperience = 2,
    maxAreas = 3,
  ): Promise<ProjectRequirements> {
    const areas = await this.prisma.expertiseArea.findMany({
      select: { id: true, name: true, category: true },
    });
    const text = this.normalize(segments.filter(Boolean).join(' '));

    const scored = areas
      .map((area) => ({ area, score: this.areaScore(area, text) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      requiredAreas: scored.slice(0, maxAreas).map((entry) => entry.area.id),
      requiredAreaNames: scored.slice(0, maxAreas).map((entry) => entry.area.name),
      minYearsExperience,
    };
  }

  private projectLoadInclude() {
    return {
      context_summary: true,
      idea_sketch: true,
      problems_needs: true,
      funding_assessment: true,
    };
  }

  private extractProjectText(project: any): string[] {
    const idea = project?.idea_sketch;
    const summary = project?.context_summary;
    const needs = project?.problems_needs;
    return [
      project?.name,
      project?.description,
      summary?.summary_text,
      [idea?.idea_initial, idea?.product_service, idea?.customers, idea?.partners]
        .filter(Boolean)
        .join(' '),
      [needs?.environmental_challenges, needs?.social_challenges]
        .filter(Boolean)
        .join(' '),
    ].filter(Boolean);
  }

  private minYearsFor(funding?: { phase_maturite?: string }): number {
    return this.MIN_YEARS_BY_PHASE[funding?.phase_maturite || ''] ?? 2;
  }

  private areaScore(
    area: { name: string; category: string | null },
    text: string,
  ): number {
    const tokens = this.tokenize(
      this.normalize(`${area.name} ${area.category || ''}`),
    );
    return tokens.reduce(
      (sum, token) => sum + this.countOccurrences(text, token),
      0,
    );
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');
  }

  private tokenize(text: string): string[] {
    return text.split(/\s+/).filter((token) => token.length >= 3);
  }

  private countOccurrences(text: string, token: string): number {
    if (!text || !token) return 0;
    return (text.match(new RegExp(token, 'g')) || []).length;
  }
}