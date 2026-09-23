import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { ChromaService } from './chroma.service';
import { EmbeddingsService } from './embeddings.service';
import { RagDocument } from './interfaces/ai.types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly chroma: ChromaService,
    private readonly embeddings: EmbeddingsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async generateContextSummary(projectId: string): Promise<{ summaryText: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        idea_sketch: true,
        problems_needs: true,
        pestel: true,
        objective: true,
        mission_vision: true,
      },
    });

    if (!project) throw new Error(`Project ${projectId} not found`);

    const prompt = `Génère un résumé de contexte et des objectifs pour un projet d'entrepreneuriat vert.

Voici les données du projet "${project.name}" :

IDÉE : ${project.idea_sketch?.idea_initial || 'Non renseigné'}
PRODUIT/SERVICE : ${project.idea_sketch?.product_service || 'Non renseigné'}
CLIENTS CIBLES : ${project.idea_sketch?.customers || 'Non renseigné'}
PARTENAIRES : ${project.idea_sketch?.partners || 'Non renseigné'}

PROBLÈMES ENVIRONNEMENTAUX : ${project.problems_needs?.environmental_challenges || 'Non renseigné'}
PROBLÈMES SOCIAUX : ${project.problems_needs?.social_challenges || 'Non renseigné'}
BESOINS CLIENTS : ${project.problems_needs?.customer_needs || 'Non renseigné'}
MOTIVATIONS : ${project.problems_needs?.team_motivations || 'Non renseigné'}

PESTEL — Politique : ${project.pestel?.political_what || 'N/A'}
PESTEL — Économique : ${project.pestel?.economic_what || 'N/A'}
PESTEL — Social : ${project.pestel?.social_what || 'N/A'}
PESTEL — Technologique : ${project.pestel?.technological_what || 'N/A'}
PESTEL — Environnemental : ${project.pestel?.environmental_what || 'N/A'}
PESTEL — Légal : ${project.pestel?.legal_what || 'N/A'}

OBJECTIFS ENVIRONNEMENTAUX : ${project.objective?.environmental_objectives || 'Non renseigné'}
OBJECTIFS SOCIAUX : ${project.objective?.social_objectives || 'Non renseigné'}
OBJECTIFS CLIENTS : ${project.objective?.customer_objectives || 'Non renseigné'}

MISSION : ${project.mission_vision?.mission || 'Non renseigné'}
VISION : ${project.mission_vision?.vision || 'Non renseigné'}
VALEURS : ${project.mission_vision?.values || 'Non renseigné'}

Rédige un résumé de contexte professionnel et concis (300-400 mots) qui synthétise le projet, son environnement, ses objectifs et sa vision. Structure le texte en 3 paragraphes : 1) Contexte et problématique, 2) Objectifs et stratégie, 3) Mission et vision.`;

    const response = await this.llm.generate(prompt);

    const saved = await this.prisma.contextSummary.upsert({
      where: { project_id: projectId },
      create: {
        project_id: projectId,
        summary_text: response.content,
        generated_by_ai: true,
      },
      update: {
        summary_text: response.content,
        generated_by_ai: true,
      },
    });

    await this.indexInChroma(projectId, 'context_summary', saved.summary_text || '');

    const { title, message } = this.messageBuilder.aiResponseReady({ label: 'Résumé de contexte IA' });
    this.eventEmitter.emit(
      NotificationEvent.AI_RESPONSE_READY,
      {
        event: NotificationEvent.AI_RESPONSE_READY,
        recipients: [{ userId: project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${projectId}/documents`,
        senderId: project.owner_id,
        resourceType: 'PROJECT',
        resourceId: projectId,
      } as NotificationPayload,
    );

    return { summaryText: saved.summary_text || '' };
  }

  async generateActivitySummary(projectId: string): Promise<{ activitiesSummary: string; keyAchievements: string; nextSteps: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        key_activities_resource: true,
        eco_design: true,
        eco_design_result: true,
        stakeholder: true,
        customer_segment: true,
        value_proposition: true,
      },
    });

    if (!project) throw new Error(`Project ${projectId} not found`);

    const prompt = `Génère un résumé des activités clés et des ressources du projet "${project.name}".

ACTIVITÉS CLÉS : ${project.key_activities_resource?.key_activities || 'Non renseigné'}
RESSOURCES CLÉS : ${project.key_activities_resource?.key_resources || 'Non renseigné'}
PARTENAIRES STRATÉGIQUES : ${project.key_activities_resource?.strategic_partners || 'Non renseigné'}

ÉCOCONCEPTION : ${project.eco_design?.projet_eco || 'Non renseigné'}
RÉSULTATS ÉCOCONCEPTION : ${project.eco_design_result?.eco_results || 'Non renseigné'}

PARTIES PRENANTES : ${project.stakeholder?.map(s => s.name).join(', ') || 'Non renseigné'}
SEGMENTS CLIENTS : ${project.customer_segment?.map(c => c.segment_name).join(', ') || 'Non renseigné'}
PROPOSITION DE VALEUR : ${project.value_proposition?.value_added || 'Non renseigné'}

Rédige un résumé structuré avec 3 sections :
1) Résumé des activités et ressources déployées
2) Principales réalisations et points forts
3) Prochaines étapes recommandées

Retourne UNIQUEMENT un objet JSON valide avec les clés : activities_summary, key_achievements, next_steps`;

    const response = await this.llm.generate(prompt, { temperature: 0.5 });

    let parsed: { activities_summary?: string; key_achievements?: string; next_steps?: string } = {};
    try {
      parsed = JSON.parse(response.content);
    } catch {
      parsed = {
        activities_summary: response.content,
        key_achievements: '',
        next_steps: '',
      };
    }

    const saved = await this.prisma.summaryActivity.upsert({
      where: { project_id: projectId },
      create: {
        project_id: projectId,
        activities_summary: parsed.activities_summary || response.content,
        key_achievements: parsed.key_achievements || '',
        next_steps: parsed.next_steps || '',
        generated_by_ai: true,
      },
      update: {
        activities_summary: parsed.activities_summary || response.content,
        key_achievements: parsed.key_achievements || '',
        next_steps: parsed.next_steps || '',
        generated_by_ai: true,
      },
    });

    await this.indexInChroma(projectId, 'activity_summary', saved.activities_summary || '');

    const { title, message } = this.messageBuilder.aiResponseReady({ label: 'Résumé d\'activité IA' });
    this.eventEmitter.emit(
      NotificationEvent.AI_RESPONSE_READY,
      {
        event: NotificationEvent.AI_RESPONSE_READY,
        recipients: [{ userId: project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${projectId}/documents`,
        senderId: project.owner_id,
        resourceType: 'PROJECT',
        resourceId: projectId,
      } as NotificationPayload,
    );

    return {
      activitiesSummary: saved.activities_summary || '',
      keyAchievements: saved.key_achievements || '',
      nextSteps: saved.next_steps || '',
    };
  }

  async generateCostRevenueSummary(projectId: string): Promise<{ costSummary: string; revenueSummary: string; financialHealth: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        cost_structure: true,
        revenue_stream: true,
      },
    });

    if (!project) throw new Error(`Project ${projectId} not found`);

    const prompt = `Génère un résumé financier pour le projet "${project.name}".

COÛTS FIXES : ${project.cost_structure?.fixed_costs || 'Non renseigné'}
COÛTS VARIABLES : ${project.cost_structure?.variable_costs || 'Non renseigné'}
FACTEURS DE COÛTS : ${project.cost_structure?.cost_drivers || 'Non renseigné'}
ANALYSE SEUIL RENTABILITÉ : ${project.cost_structure?.breakeven_analysis || 'Non renseigné'}

SOURCES DE REVENUS : ${project.revenue_stream?.revenue_sources || 'Non renseigné'}
STRATÉGIE DE PRIX : ${project.revenue_stream?.pricing_strategy || 'Non renseigné'}
PROJECTIONS : ${project.revenue_stream?.revenue_projections || 'Non renseigné'}

Retourne UNIQUEMENT un objet JSON avec les clés : cost_summary, revenue_summary, financial_health`;

    const response = await this.llm.generate(prompt, { temperature: 0.3 });

    let parsed: { cost_summary?: string; revenue_summary?: string; financial_health?: string } = {};
    try {
      parsed = JSON.parse(response.content);
    } catch {
      parsed = { cost_summary: response.content };
    }

    const saved = await this.prisma.costRevenueSummary.upsert({
      where: { project_id: projectId },
      create: {
        project_id: projectId,
        cost_summary: parsed.cost_summary || response.content,
        revenue_summary: parsed.revenue_summary || '',
        financial_health: parsed.financial_health || '',
        generated_by_ai: true,
      },
      update: {
        cost_summary: parsed.cost_summary || response.content,
        revenue_summary: parsed.revenue_summary || '',
        financial_health: parsed.financial_health || '',
        generated_by_ai: true,
      },
    });

    await this.indexInChroma(projectId, 'cost_revenue_summary', `Coûts: ${saved.cost_summary || ''}. Revenus: ${saved.revenue_summary || ''}. Santé: ${saved.financial_health || ''}`);

    const { title, message } = this.messageBuilder.aiResponseReady({ label: 'Résumé coûts/revenus IA' });
    this.eventEmitter.emit(
      NotificationEvent.AI_RESPONSE_READY,
      {
        event: NotificationEvent.AI_RESPONSE_READY,
        recipients: [{ userId: project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${projectId}/documents`,
        senderId: project.owner_id,
        resourceType: 'PROJECT',
        resourceId: projectId,
      } as NotificationPayload,
    );

    return {
      costSummary: saved.cost_summary || '',
      revenueSummary: saved.revenue_summary || '',
      financialHealth: saved.financial_health || '',
    };
  }

  async generateExecutiveSummary(projectId: string): Promise<{ executiveSummary: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        context_summary: true,
        summary_activity: true,
        cost_revenue_summary: true,
        mission_vision: true,
        value_proposition: true,
        impact_measure: true,
      },
    });

    if (!project) throw new Error(`Project ${projectId} not found`);

    const prompt = `Génère un résumé analytique (executive summary) complet pour investisseurs pour le projet "${project.name}".

CONTEXTE : ${project.context_summary?.summary_text || 'Non disponible'}
RÉSUMÉ ACTIVITÉS : ${project.summary_activity?.activities_summary || 'Non disponible'}
RÉSUMÉ FINANCIER : ${project.cost_revenue_summary?.cost_summary || 'Non disponible'}
SANTÉ FINANCIÈRE : ${project.cost_revenue_summary?.financial_health || 'Non disponible'}
MISSION : ${project.mission_vision?.mission || 'Non renseigné'}
VALEUR AJOUTÉE : ${project.value_proposition?.value_added || 'Non renseigné'}
IMPACT ENVIRONNEMENTAL : ${project.impact_measure?.rapport_impact || 'Non renseigné'}

Rédige un executive summary professionnel de 400-500 mots destiné à des investisseurs. Structure : 1) Vision et proposition de valeur, 2) Modèle d'affaires et avantage concurrentiel, 3) Projections financières, 4) Impact environnemental et social.`;

    const response = await this.llm.generate(prompt, { temperature: 0.4 });

    const saved = await this.prisma.executiveSummary.upsert({
      where: { project_id: projectId },
      create: {
        project_id: projectId,
        resume_executif: response.content,
        generated_by_ai: true,
      },
      update: {
        resume_executif: response.content,
        generated_by_ai: true,
      },
    });

    await this.indexInChroma(projectId, 'executive_summary', saved.resume_executif || '');

    const { title, message } = this.messageBuilder.aiResponseReady({ label: 'Résumé exécutif IA' });
    this.eventEmitter.emit(
      NotificationEvent.AI_RESPONSE_READY,
      {
        event: NotificationEvent.AI_RESPONSE_READY,
        recipients: [{ userId: project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${projectId}/documents`,
        senderId: project.owner_id,
        resourceType: 'PROJECT',
        resourceId: projectId,
      } as NotificationPayload,
    );

    return { executiveSummary: saved.resume_executif || '' };
  }

  private async indexInChroma(projectId: string, stepKey: string, content: string): Promise<void> {
    if (!content || content.trim().length < 10) return;

    try {
      const embeddings = await this.embeddings.generate([content]);
      const documents: RagDocument[] = [{
        id: `${projectId}_${stepKey}_${Date.now()}`,
        content: `[${stepKey}] ${content}`,
        metadata: { project_id: projectId, step_key: stepKey },
      }];
      await this.chroma.addDocuments(projectId, documents, embeddings);
      this.logger.log(`Indexed ${stepKey} in Chroma for project ${projectId}`);
    } catch (error) {
      this.logger.warn(`Failed to index ${stepKey} in Chroma: ${error.message}`);
    }
  }
}
