import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../ai/llm.service';
import { StepStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { SectionStepService } from '../common/services/section-step.service';

@Injectable()
export class SwotService {
  private readonly logger = new Logger(SwotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionStepService,
    private readonly llm: LlmService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async getSwotAnalysis(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const swot = await (this.prisma as any).swotAnalysis.findUnique({
      where: { project_id: projectId },
    });

    return swot || null;
  }

  async generateSwotAnalysis(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        idea_sketch: true,
        problems_needs: true,
        pestel: true,
        objective: true,
        mission_vision: true,
        stakeholder: true,
        customer_segment: true,
        value_proposition: true,
        test_discovery: true,
        key_activities_resource: true,
        eco_design: true,
        eco_design_result: true,
        cost_structure: true,
        revenue_stream: true,
        cost_revenue_summary: true,
        summary_activity: true,
        context_summary: true,
        value_proposition_pivot: true,
        customer_relations_channel: true,
        customer_journey: true,
      },
    });

    if (!project) throw new NotFoundException('Projet introuvable');

    const prompt = this.buildSwotPrompt(project);

    const response = await this.llm.generate(prompt, { temperature: 0.5, maxTokens: 2000 });

    let parsed: { strengths?: string; weaknesses?: string; opportunities?: string; threats?: string } = {};
    try {
      parsed = JSON.parse(response.content);
    } catch {
      parsed = {
        strengths: response.content,
        weaknesses: '',
        opportunities: '',
        threats: '',
      };
    }

    const saved = await (this.prisma as any).swotAnalysis.upsert({
      where: { project_id: projectId },
      create: {
        project_id: projectId,
        strengths: parsed.strengths || '',
        weaknesses: parsed.weaknesses || '',
        opportunities: parsed.opportunities || '',
        threats: parsed.threats || '',
      },
      update: {
        strengths: parsed.strengths || '',
        weaknesses: parsed.weaknesses || '',
        opportunities: parsed.opportunities || '',
        threats: parsed.threats || '',
      },
    });

    await this.sections.markStepProgress(projectId, 'gbm_21', 'COMPLETED');

    await this.prisma.aiInteraction.create({
      data: {
        project_id: projectId,
        step_key: 'gbm_21',
        prompt: 'Génération de l\'analyse SWOT à partir de toutes les étapes du GBM',
        response: response.content,
        model: response.model || 'llama-3.3-70b-versatile',
      },
    });

    const { title, message } = this.messageBuilder.aiResponseReady({ label: 'Analyse SWOT' });
    this.eventEmitter.emit(
      NotificationEvent.AI_RESPONSE_READY,
      {
        event: NotificationEvent.AI_RESPONSE_READY,
        recipients: [{ userId }],
        title,
        message,
        link: `/project-owner/projects/${projectId}/swot`,
        senderId: userId,
        resourceType: 'PROJECT',
        resourceId: projectId,
      } as NotificationPayload,
    );

    return saved;
  }

  async updateSwotAnalysis(projectId: string, data: any, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const saved = await (this.prisma as any).swotAnalysis.upsert({
      where: { project_id: projectId },
      create: {
        project_id: projectId,
        ...data,
      },
      update: data,
    });

    return saved;
  }

  private buildSwotPrompt(project: any): string {
    const fmt = (val: any) => val || 'Non renseigné';

    return `Tu es un expert en stratégie d'entrepreneuriat vert. Génère une analyse SWOT complète pour le projet "${project.name}".

Voici toutes les données du projet :

=== IDÉE ===
Idée: ${fmt(project.idea_sketch?.idea_initial)}
Produit/Service: ${fmt(project.idea_sketch?.product_service)}
Clients cibles: ${fmt(project.idea_sketch?.customers)}
Partenaires: ${fmt(project.idea_sketch?.partners)}

=== PROBLÈMES & BESOINS ===
Défis environnementaux: ${fmt(project.problems_needs?.environmental_challenges)}
Défis sociaux: ${fmt(project.problems_needs?.social_challenges)}
Besoins clients: ${fmt(project.problems_needs?.customer_needs)}
Motivations: ${fmt(project.problems_needs?.team_motivations)}

=== PESTEL ===
Politique: ${fmt(project.pestel?.political_what)} — ${fmt(project.pestel?.political_how)}
Économique: ${fmt(project.pestel?.economic_what)} — ${fmt(project.pestel?.economic_how)}
Social: ${fmt(project.pestel?.social_what)} — ${fmt(project.pestel?.social_how)}
Technologique: ${fmt(project.pestel?.technological_what)} — ${fmt(project.pestel?.technological_how)}
Environnemental: ${fmt(project.pestel?.environmental_what)} — ${fmt(project.pestel?.environmental_how)}
Légal: ${fmt(project.pestel?.legal_what)} — ${fmt(project.pestel?.legal_how)}

=== OBJECTIFS ===
Environnementaux: ${fmt(project.objective?.environmental_objectives)}
Sociaux: ${fmt(project.objective?.social_objectives)}
Clients: ${fmt(project.objective?.customer_objectives)}

=== MISSION & VISION ===
Mission: ${fmt(project.mission_vision?.mission)}
Vision: ${fmt(project.mission_vision?.vision)}
Valeurs: ${fmt(project.mission_vision?.values)}

=== PARTIES PRENANTES ===
${project.stakeholder?.map((s: any) => `- ${s.name} (${s.role}): ${s.interest || ''}`).join('\n') || 'Non renseigné'}

=== SEGMENTS CLIENTS ===
${project.customer_segment?.map((c: any) => `- ${c.segment_name}: ${c.description || ''} (douleurs: ${c.pains || ''}, gains: ${c.gains || ''})`).join('\n') || 'Non renseigné'}

=== PROPOSITION DE VALEUR ===
Valeur environnementale: ${fmt(project.value_proposition?.environmental_value)}
Valeur sociale: ${fmt(project.value_proposition?.social_value)}
Valeur ajoutée: ${fmt(project.value_proposition?.value_added)}
Innovation: ${fmt(project.value_proposition?.innovation_value)}
${project.value_proposition_pivot?.new_value_proposition ? `Pivot: ${fmt(project.value_proposition_pivot.new_value_proposition)}` : ''}

=== TESTS ===
${project.test_discovery?.map((t: any) => `- Hypothèse: ${t.hypothesis}, Résultat: ${t.results || 'en cours'}, Validé: ${t.validated ? 'Oui' : 'Non'}`).join('\n') || 'Aucun test'}

=== ACTIVITÉS & RESSOURCES ===
Activités clés: ${fmt(project.key_activities_resource?.key_activities)}
Ressources clés: ${fmt(project.key_activities_resource?.key_resources)}
Partenaires stratégiques: ${fmt(project.key_activities_resource?.strategic_partners)}

=== ÉCOCONCEPTION ===
Projet éco: ${fmt(project.eco_design?.projet_eco)}
Vision durable: ${fmt(project.eco_design?.vision_durable)}
Résultats: ${fmt(project.eco_design_result?.eco_results)}

=== STRUCTURE FINANCIÈRE ===
Coûts fixes: ${fmt(project.cost_structure?.fixed_costs)}
Coûts variables: ${fmt(project.cost_structure?.variable_costs)}
Sources de revenus: ${fmt(project.revenue_stream?.revenue_sources)}
Stratégie de prix: ${fmt(project.revenue_stream?.pricing_strategy)}

Retourne UNIQUEMENT un objet JSON valide avec les clés suivantes :
{
  "strengths": "Analyse détaillée des forces du projet (5-8 points, avec justifications basées sur les données)",
  "weaknesses": "Analyse détaillée des faiblesses du projet (5-8 points, avec justifications)",
  "opportunities": "Analyse détaillée des opportunités (5-8 points, liées au contexte PESTEL et au marché)",
  "threats": "Analyse détaillée des menaces (5-8 points, liées au contexte et à la concurrence)"
}

Chaque section doit faire au moins 150 mots et être spécifique au projet. Pas de contenu générique.`;
  }
}
