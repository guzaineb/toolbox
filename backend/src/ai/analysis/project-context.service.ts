import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { computeWeightedScore } from '../../evaluations/score.util';

const MAX_FIELD = 600;

function trim(value: unknown, max = MAX_FIELD): string {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function section(label: string, content: string): string {
  return content ? `\n### ${label}\n${content}` : '';
}

export interface ProjectContextResult {
  projectId: string;
  projectName: string;
  contextText: string;
}

/**
 * Construit un contexte compact (texte) d'un projet pour les prompts LLM.
 * N'envoie que les données pertinentes — jamais tout le projet brut.
 */
@Injectable()
export class ProjectContextBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async build(projectId: string): Promise<ProjectContextResult> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        idea_sketch: true,
        problems_needs: true,
        mission_vision: true,
        value_proposition: true,
        customer_segment: { select: { segment_name: true, description: true, pains: true } },
        test_discovery: { select: { hypothesis: true, results: true, validated: true } },
        cost_structure: true,
        revenue_stream: true,
        management_plan: { select: { ressources_humaines: true } },
        marketing_plan: { select: { analyse_marche: true, concurrents: true, offre_prix: true } },
        financial_plan: { select: { capital: true, seuil_rentabilite: true } },
        impact_measure: {
          select: { kpis_environnementaux: true, kpis_sociaux: true, resultats_actuels: true },
        },
        market_access: { select: { positionnement: true, narration: true } },
        swot_analysis: true,
        executive_summary: { select: { resume_executif: true } },
        step_progresses: { select: { step_key: true, status: true } },
      },
    });

    if (!project) {
      return { projectId, projectName: 'Projet', contextText: '' };
    }

    const parts: string[] = [];
    parts.push(
      section('PROJET', `Nom : ${project.name}\nDescription : ${trim(project.description)}`),
    );
    parts.push(
      section(
        'IDÉE & PROBLÉMATIQUE',
        [
          `Idée : ${trim(project.idea_sketch?.idea_initial)}`,
          `Produit/Service : ${trim(project.idea_sketch?.product_service)}`,
          `Défis environnementaux : ${trim(project.problems_needs?.environmental_challenges, 300)}`,
          `Besoins clients : ${trim(project.problems_needs?.customer_needs, 300)}`,
        ]
          .filter((l) => !l.endsWith(': '))
          .join('\n'),
      ),
    );
    parts.push(
      section(
        'MISSION',
        `Mission : ${trim(project.mission_vision?.mission, 250)}\nVision : ${trim(project.mission_vision?.vision, 250)}`,
      ),
    );

    if (project.value_proposition?.value_added || project.customer_segment.length > 0) {
      const segments = project.customer_segment
        .slice(0, 5)
        .map((s) => `- ${trim(s.segment_name)} : ${trim(s.description, 150)}`)
        .join('\n');
      parts.push(
        section(
          'CLIENTS & VALEUR',
          `Proposition de valeur : ${trim(project.value_proposition?.value_added)}\nSegments :\n${segments}`,
        ),
      );
    }

    if (project.test_discovery.length > 0) {
      const tests = project.test_discovery
        .slice(0, 5)
        .map(
          (t) =>
            `- Hypothèse : ${trim(t.hypothesis, 120)} | Résultat : ${trim(t.results, 120)} | Validé : ${
              t.validated === true ? 'oui' : t.validated === false ? 'non' : '?'
            }`,
        )
        .join('\n');
      parts.push(section('TESTS DE VALIDATION', tests));
    }

    parts.push(
      section(
        'MARCHÉ & MARKETING',
        [
          `Analyse de marché : ${trim(project.marketing_plan?.analyse_marche, 300)}`,
          `Concurrents : ${trim(project.marketing_plan?.concurrents, 200)}`,
          `Offre/prix : ${trim(project.marketing_plan?.offre_prix, 200)}`,
          `Positionnement : ${trim(project.market_access?.positionnement, 200)}`,
        ]
          .filter((l) => !/: $/.test(l))
          .join('\n'),
      ),
    );

    parts.push(
      section(
        'FINANCES',
        [
          `Coûts fixes : ${trim(project.cost_structure?.fixed_costs, 200)}`,
          `Coûts variables : ${trim(project.cost_structure?.variable_costs, 200)}`,
          `Sources de revenus : ${trim(project.revenue_stream?.revenue_sources, 200)}`,
          `Stratégie de prix : ${trim(project.revenue_stream?.pricing_strategy, 200)}`,
          `Capital : ${project.financial_plan?.capital ?? 'non renseigné'}`,
          `Seuil de rentabilité : ${project.financial_plan?.seuil_rentabilite ?? 'non renseigné'}`,
        ].join('\n'),
      ),
    );

    parts.push(
      section(
        'IMPACT',
        [
          `KPIs environnementaux : ${trim(project.impact_measure?.kpis_environnementaux, 250)}`,
          `KPIs sociaux : ${trim(project.impact_measure?.kpis_sociaux, 250)}`,
          `Résultats actuels : ${trim(project.impact_measure?.resultats_actuels, 250)}`,
        ].join('\n'),
      ),
    );

    if (project.swot_analysis) {
      parts.push(
        section(
          'SWOT (existant)',
          [
            `Forces : ${trim(project.swot_analysis.strengths, 250)}`,
            `Faiblesses : ${trim(project.swot_analysis.weaknesses, 250)}`,
            `Opportunités : ${trim(project.swot_analysis.opportunities, 200)}`,
            `Menaces : ${trim(project.swot_analysis.threats, 200)}`,
          ].join('\n'),
        ),
      );
    }

    // Évaluations (scores par critère)
    const evaluations = await this.prisma.evaluation.findMany({
      where: { project_id: projectId, status: 'SUBMITTED' },
      include: {
        template: { include: { criteria: { orderBy: { sort_order: 'asc' } } } },
        scores: true,
      },
      orderBy: { submitted_at: 'desc' },
      take: 3,
    });
    if (evaluations.length > 0) {
      const evalLines: string[] = [];
      for (const evaluation of [...evaluations].reverse()) {
        const computation = evaluation.template
          ? computeWeightedScore(evaluation.template.criteria, evaluation.scores)
          : null;
        evalLines.push(
          `Évaluation v${evaluation.version} (${evaluation.submitted_at?.toISOString().slice(0, 10) ?? 'n/d'}) : ${
            computation ? `${computation.total20}/20` : trim(evaluation.score)
          }`,
        );
        if (evaluation.template) {
          for (const criterion of evaluation.template.criteria) {
            const score = evaluation.scores.find((s) => s.criterion_id === criterion.id);
            if (score) {
              evalLines.push(`  - ${criterion.name} : ${score.score}/${criterion.max_score}`);
            }
          }
        }
        if (evaluation.comment) evalLines.push(`  Commentaire jury : ${trim(evaluation.comment, 400)}`);
      }
      parts.push(section('ÉVALUATIONS', evalLines.join('\n')));
    }

    // Coaching : recommandations ouvertes + actions récentes
    const [openRecommendations, recentActions] = await Promise.all([
      this.prisma.coachingRecommendation.findMany({
        where: { project_id: projectId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
        select: { title: true, content: true, priority: true, source: true },
        orderBy: { created_at: 'desc' },
        take: 6,
      }),
      this.prisma.coachingAction.findMany({
        where: { project_id: projectId },
        select: { title: true, status: true, deadline: true },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
    ]);
    if (openRecommendations.length > 0) {
      parts.push(
        section(
          'RECOMMANDATIONS OUVERTES',
          openRecommendations
            .map((r) => `- [${r.priority}${r.source === 'AI' ? '/IA' : ''}] ${trim(r.title ?? r.content, 180)}`)
            .join('\n'),
        ),
      );
    }
    if (recentActions.length > 0) {
      parts.push(
        section(
          'ACTIONS DE COACHING',
          recentActions
            .map((a) => `- ${trim(a.title, 120)} (${a.status}${a.deadline ? `, échéance ${a.deadline.toISOString().slice(0, 10)}` : ''})`)
            .join('\n'),
        ),
      );
    }

    // Sessions de coaching passées
    const sessions = await this.prisma.coachingSession.findMany({
      where: { assignment: { project_id: projectId }, status: 'COMPLETED' },
      select: { title: true, objective: true, summary: true, notes: true, completed_at: true },
      orderBy: { scheduled_at: 'desc' },
      take: 3,
    });
    if (sessions.length > 0) {
      parts.push(
        section(
          'SESSIONS DE COACHING PASSÉES',
          sessions
            .reverse()
            .map(
              (s) =>
                `- Session du ${s.completed_at?.toISOString().slice(0, 10) ?? 'n/d'}${s.objective ? ` — Objectif : ${trim(s.objective, 120)}` : ''}${
                  s.summary ? `\n  Résumé : ${trim(s.summary, 350)}` : ''
                }`,
            )
            .join('\n'),
        ),
      );
    }

    // Plans d'amélioration actifs
    const plan = await this.prisma.improvementPlan.findFirst({
      where: { project_id: projectId, status: { in: ['DRAFT', 'ACTIVE'] } },
      include: { objectives: { orderBy: { created_at: 'asc' } } },
    });
    if (plan) {
      parts.push(
        section(
          "PLAN D'AMÉLIORATION",
          [
            `Statut : ${plan.status} | Progression : ${plan.progress}%`,
            ...plan.objectives.map(
              (o) => `- [${o.status}] ${o.title} (priorité ${o.priority}, progression ${o.progress}%)`,
            ),
          ].join('\n'),
        ),
      );
    }

    const completedSteps = project.step_progresses.filter((p) => p.status === 'COMPLETED').length;

    return {
      projectId,
      projectName: project.name,
      contextText: [
        `Avancement GBM : ${completedSteps}/${project.step_progresses.length || 21} étapes complétées.`,
        ...parts,
      ]
        .join('\n')
        .trim(),
    };
  }
}
