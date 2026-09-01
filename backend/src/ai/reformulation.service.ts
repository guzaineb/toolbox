import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

const STEP_CONCEPTS: Record<string, string> = {
  gbm_1: 'Esquisse d\'idée — définition du concept de base, produit/service, clients et partenaires',
  gbm_2: 'Problèmes et besoins — identification des défis environnementaux, sociaux et besoins clients',
  gbm_3: 'Analyse PESTEL — compréhension du contexte politique, économique, social, technologique, environnemental et légal',
  gbm_4: 'Objectifs — fixation d\'objectifs environnementaux, sociaux, clients et équipe',
  gbm_5: 'Mission et vision — synthèse de la mission, vision et valeurs du projet',
  gbm_6: 'Résumé du contexte — synthèse globale du contexte et des objectifs',
  gbm_7a: 'Parties prenantes — identification et cartographie des parties prenantes',
  gbm_7b: 'Cartes des parties prenantes — relations donnant-donnant avec chaque partie prenante',
  gbm_8: 'Segments de clientèle — définition des segments de clientèle cibles',
  gbm_9: 'Proposition de valeur — canevas de proposition de valeur durable',
  gbm_10: 'Test de la proposition de valeur — validation par des tests terrain',
  gbm_11: 'Pivot de la proposition de valeur — ajustement basé sur les tests',
  gbm_12a: 'Relations clients et canaux — stratégie de relation et distribution',
  gbm_12b: 'Parcours du client — expérience et parcours de chaque segment',
  gbm_13: 'Activités et ressources clés — identification des activités et ressources critiques',
  gbm_14a: 'Écoconception — conception durable du modèle d\'affaires',
  gbm_14b: 'Résultats de l\'écoconception — impacts obtenus par la stratégie d\'écoconception',
  gbm_15: 'Résumé des activités — synthèse des activités et ressources',
  gbm_16: 'Structure des coûts — analyse des coûts fixes, variables et seuil de rentabilité',
  gbm_17: 'Flux de revenus — sources de revenus et stratégie de prix',
  gbm_18: 'Résumé financier — synthèse coûts/revenus et santé financière',
  gbm_19: 'Préparation des tests — planification des tests de validation',
  gbm_20: 'Indicateurs — définition des KPIs environnementaux, sociaux et économiques',
  gbm_21: 'Analyse SWOT — forces, faiblesses, opportunités et menaces synthétisées',
};

@Injectable()
export class ReformulationService {
  private readonly logger = new Logger(ReformulationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async reformulateStep(
    projectId: string,
    stepKey: string,
    audience: 'debutant' | 'intermediaire' | 'avance' = 'intermediaire',
  ): Promise<{ original: string; reformulated: string; concept: string }> {
    const stepData = await this.fetchStepData(projectId, stepKey);
    const concept = STEP_CONCEPTS[stepKey] || `Étape ${stepKey} du business model`;

    if (!stepData || !stepData.content) {
      throw new Error(`Aucune donnée trouvée pour l'étape ${stepKey} du projet ${projectId}`);
    }

    const audienceInstructions: Record<string, string> = {
      debutant: 'Utilise un langage simple et accessible. Explique les concepts comme si tu t\'adressais à un débutant complet. Évite le jargon technique. Ajoute des analogies concrètes.',
      intermediaire: 'Utilise un langage clair mais précis. Garde la terminologie métier tout en t\'assurant que c\'est compréhensible. Ajoute des exemples pertinents.',
      avance: 'Utilise un langage technique et précis. Tu t\'adresses à un expert. Approfondis les concepts et ajoute des nuances stratégiques.',
    };

    const prompt = `Tu es un coach pédagogique en entrepreneuriat durable. Voici les données brutes saisies par un porteur de projet pour l'étape "${concept}".

DONNÉES BRUTES :
${stepData.content}

INSTRUCTION PÉDAGOGIQUE :
${audienceInstructions[audience]}

Ta mission :
1. Reformule ces données de manière pédagogique et structurée
2. Explique pourquoi cette étape est importante dans le business model
3. Mets en évidence les points forts et les axes d'amélioration
4. Propose 1-2 questions de réflexion pour approfondir

La reformulation doit être en français, bien structurée (titres, paragraphes) et adaptée au niveau "${audience}".

Retourne UNIQUEMENT un objet JSON avec les clés : reformulated_text, key_strengths (array), improvement_axes (array), reflection_questions (array)`;

    const response = await this.llm.generate(prompt, { temperature: 0.6 });

    let parsed: any = {};
    try {
      parsed = JSON.parse(response.content);
    } catch {
      parsed = { reformulated_text: response.content, key_strengths: [], improvement_axes: [], reflection_questions: [] };
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });

    if (project) {
      const { title, message } = this.messageBuilder.aiResponseReady({ label: 'Reformulation IA' });
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
    }

    return {
      original: stepData.content,
      reformulated: parsed.reformulated_text || response.content,
      concept,
    };
  }

  async reformulateText(
    text: string,
    stepConcept: string,
    audience: 'debutant' | 'intermediaire' | 'avance' = 'intermediaire',
  ): Promise<{ original: string; reformulated: string }> {
    const audienceInstructions: Record<string, string> = {
      debutant: 'langage simple et accessible, comme pour un débutant complet',
      intermediaire: 'langage clair avec terminologie métier, adapté à un entrepreneur averti',
      avance: 'langage technique et précis, adapté à un expert en entrepreneuriat',
    };

    const prompt = `Reformule le texte suivant de manière pédagogique (niveau : ${audienceInstructions[audience]}).

Contexte : il s'agit de données liées à "${stepConcept}" dans un business model d'entrepreneuriat vert.

TEXTE À REFORMULER :
${text}

Consignes :
- Reformulation claire, structurée et pédagogique
- Garde le sens original mais améliore la clarté
- Ajoute une brève explication du concept si pertinent
- Maximum 300 mots`;

    const response = await this.llm.generate(prompt, { temperature: 0.5 });

    return {
      original: text,
      reformulated: response.content,
    };
  }

  private async fetchStepData(projectId: string, stepKey: string): Promise<{ content: string } | null> {
    const stepToModel: Record<string, string> = {
      gbm_1: 'idea_sketch',
      gbm_2: 'problems_needs',
      gbm_3: 'pestel',
      gbm_4: 'objective',
      gbm_5: 'mission_vision',
      gbm_6: 'context_summary',
      gbm_7a: 'stakeholder',
      gbm_7b: 'stakeholder_map',
      gbm_8: 'customer_segment',
      gbm_9: 'value_proposition',
      gbm_10: 'test_discovery',
      gbm_11: 'value_proposition_pivot',
      gbm_12a: 'customer_relations_channel',
      gbm_12b: 'customer_journey',
      gbm_13: 'key_activities_resource',
      gbm_14a: 'eco_design',
      gbm_14b: 'eco_design_result',
      gbm_15: 'summary_activity',
      gbm_16: 'cost_structure',
      gbm_17: 'revenue_stream',
      gbm_18: 'cost_revenue_summary',
      gbm_19: 'test_preparation',
      gbm_20: 'indicator',
      gbm_21: 'swot_analysis',
    };

    const modelName = stepToModel[stepKey];
    if (!modelName) {
      return { content: `Données de l'étape ${stepKey} (non mappée à un modèle spécifique)` };
    }

    const data = await (this.prisma.project as any).findUnique({
      where: { id: projectId },
      include: { [modelName]: true },
    });

    if (!data || !data[modelName]) return null;

    const rowFields = (row: Record<string, unknown>): string => {
      const fields = Object.keys(row).filter(k => !['id', 'project_id', 'created_at', 'updated_at'].includes(k));
      return fields.map(f => `${f.replace(/_/g, ' ')} : ${row[f] || 'Non renseigné'}`).join('\n');
    };

    const record = data[modelName];
    if (Array.isArray(record)) {
      if (record.length === 0) return null;
      return { content: record.map((row, i) => `--- Élément ${i + 1} ---\n${rowFields(row)}`).join('\n') };
    }

    return { content: rowFields(record) };
  }
}
