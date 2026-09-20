import { Injectable } from '@nestjs/common';
import { ProjectAnalyzer } from './project-analyzer.service';
import { ConsistencyChecker, ConsistencyInput } from './consistency-checker.service';
import { HealthDiagnostic, Inconsistency } from './project-state.types';

type HealthInput = {
  completeness: {
    gbm: { percentage: number; completed: number; total: number };
    businessPlan: { percentage: number; completed: number; total: number };
    transversal: Record<string, boolean>;
  };
  progress: {
    overallPercentage: number;
    gbmPercentage: number;
    bpPercentage: number;
  };
  maturityScore: number;
  consistencyInput: ConsistencyInput;
  coachingEngagement: number;
  strengths: string[];
  weakAreas: string[];
};

const WEIGHTS = {
  completeness: 0.30,
  progress: 0.25,
  coherence: 0.25,
  maturity: 0.20,
};

@Injectable()
export class ProjectHealthService {
  constructor(
    private readonly analyzer: ProjectAnalyzer,
    private readonly consistencyChecker: ConsistencyChecker,
  ) {}

  diagnose(input: HealthInput): HealthDiagnostic {
    const completenessScore = this.computeCompletenessScore(input.completeness);
    const progressScore = input.progress.overallPercentage;
    const consistencyResult = this.consistencyChecker.check(
      input.consistencyInput,
    );
    const coherenceScore = consistencyResult.score;
    const maturityScore = input.maturityScore;

    const score = Math.round(
      completenessScore * WEIGHTS.completeness +
        progressScore * WEIGHTS.progress +
        coherenceScore * WEIGHTS.coherence +
        maturityScore * WEIGHTS.maturity,
    );

    const strengths = this.buildStrengths(
      completenessScore,
      progressScore,
      coherenceScore,
      maturityScore,
      input.strengths,
    );
    const weakAreas = this.buildWeakAreas(
      completenessScore,
      progressScore,
      coherenceScore,
      maturityScore,
      consistencyResult.inconsistencies,
      input.weakAreas,
    );

    return {
      score: Math.max(0, Math.min(100, score)),
      completenessScore,
      progressScore,
      coherenceScore,
      maturityScore,
      weakAreas,
      strengths,
    };
  }

  private computeCompletenessScore(completeness: {
    gbm: { percentage: number };
    businessPlan: { percentage: number };
    transversal: Record<string, boolean>;
  }): number {
    const gbmWeight = 0.50;
    const bpWeight = 0.30;
    const transWeight = 0.20;

    const transversalValues = Object.values(completeness.transversal);
    const transversalPct =
      transversalValues.length > 0
        ? Math.round(
            (transversalValues.filter(Boolean).length /
              transversalValues.length) *
              100,
          )
        : 0;

    return Math.round(
      completeness.gbm.percentage * gbmWeight +
        completeness.businessPlan.percentage * bpWeight +
        transversalPct * transWeight,
    );
  }

  private buildStrengths(
    completeness: number,
    progress: number,
    coherence: number,
    maturity: number,
    existingStrengths: string[],
  ): string[] {
    const strengths = [...existingStrengths];

    if (completeness >= 70)
      strengths.push('Complétude globale solide');
    if (progress >= 60)
      strengths.push('Avancement GBM satisfaisant');
    if (coherence >= 80)
      strengths.push('Aucune incohérence majeure détectée');
    if (maturity >= 60)
      strengths.push('Maturité du projet avancée');

    return strengths;
  }

  private buildWeakAreas(
    completeness: number,
    progress: number,
    coherence: number,
    maturity: number,
    inconsistencies: Inconsistency[],
    existingWeakAreas: string[],
  ): string[] {
    const weak = [...existingWeakAreas];

    if (completeness < 40) weak.push('Complétude très insuffisante');
    if (progress < 25) weak.push('Avancement GBM très faible');
    if (coherence < 60) weak.push('Incohérences détectées dans les données');
    if (maturity < 30) weak.push('Maturité du projet faible');

    const criticalCount = inconsistencies.filter(
      (i) => i.severity === 'CRITICAL',
    ).length;
    if (criticalCount > 0)
      weak.push(`${criticalCount} incohérence(s) critique(s)`);

    const highCount = inconsistencies.filter(
      (i) => i.severity === 'HIGH',
    ).length;
    if (highCount >= 3)
      weak.push(`${highCount} incohérences de sévérité élevée`);

    return weak;
  }
}
