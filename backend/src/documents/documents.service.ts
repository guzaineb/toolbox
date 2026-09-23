import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../ai/llm.service';
import { DocumentPromptsService } from './document-prompts.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { SectionStepService } from '../common/services/section-step.service';

export const DOCUMENT_DEFINITIONS = [
  { key: 'idea_sketch', title: "Fiche d'idée", icon: 'Lightbulb' },
  { key: 'problems_needs', title: 'Analyse des problèmes et besoins', icon: 'AlertTriangle' },
  { key: 'pestel', title: 'Rapport PESTEL', icon: 'Globe' },
  { key: 'swot', title: 'Analyse SWOT', icon: 'Target' },
  { key: 'mission_vision', title: 'Mission, Vision et Valeurs', icon: 'Compass' },
  { key: 'stakeholders', title: 'Cartographie des parties prenantes', icon: 'Users' },
  { key: 'customer_segments', title: 'Analyse des segments clients', icon: 'UserCheck' },
  { key: 'value_proposition', title: 'Proposition de valeur', icon: 'Gem' },
  { key: 'test_reports', title: 'Rapport des tests terrain', icon: 'FlaskConical' },
  { key: 'customer_journey', title: 'Cartographie du parcours client', icon: 'Route' },
  { key: 'gbm_canvas', title: 'Green Business Model Canvas final', icon: 'LayoutGrid' },
  { key: 'management_plan', title: 'Plan de gestion', icon: 'ClipboardList' },
  { key: 'marketing_plan', title: 'Plan marketing', icon: 'Megaphone' },
  { key: 'financial_plan', title: 'Plan financier', icon: 'DollarSign' },
  { key: 'legal_plan', title: 'Plan juridique', icon: 'Scale' },
  { key: 'kpi_plan', title: 'Plan des KPIs', icon: 'BarChart3' },
  { key: 'executive_summary', title: 'Résumé exécutif', icon: 'FileText' },
  { key: 'eco_design_report', title: "Rapport d'éco-conception", icon: 'Leaf' },
  { key: 'funding_dossier', title: 'Dossier de financement', icon: 'Wallet' },
  { key: 'market_strategy', title: "Stratégie d'accès au marché", icon: 'Target' },
  { key: 'impact_report', title: "Rapport d'impact durable", icon: 'Activity' },
];

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionStepService,
    private readonly llm: LlmService,
    private readonly prompts: DocumentPromptsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async getDocumentsList(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const docs = await (this.prisma as any).generatedDocument.findMany({
      where: { project_id: projectId },
      orderBy: { document_key: 'asc' },
    }) as any[];

    const docMap = new Map<string, any>(docs.map((d: any) => [d.document_key, d]));

    return DOCUMENT_DEFINITIONS.map(def => {
      const dbDoc = docMap.get(def.key);
      return {
        key: def.key,
        title: def.title,
        icon: def.icon,
        status: dbDoc?.status || 'NOT_GENERATED',
        generatedAt: dbDoc?.generated_at || null,
        updatedAt: dbDoc?.updated_at || null,
        content: dbDoc?.content || null,
      };
    });
  }

  async getDocument(projectId: string, documentKey: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const def = DOCUMENT_DEFINITIONS.find(d => d.key === documentKey);
    if (!def) throw new NotFoundException(`Document inconnu: ${documentKey}`);

    const doc = await (this.prisma as any).generatedDocument.findUnique({
      where: {
        project_id_document_key: { project_id: projectId, document_key: documentKey },
      },
    });

    return {
      key: def.key,
      title: def.title,
      icon: def.icon,
      status: doc?.status || 'NOT_GENERATED',
      generatedAt: doc?.generated_at || null,
      updatedAt: doc?.updated_at || null,
      content: doc?.content || null,
    };
  }

  async generateDocument(projectId: string, documentKey: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const def = DOCUMENT_DEFINITIONS.find(d => d.key === documentKey);
    if (!def) throw new NotFoundException(`Document inconnu: ${documentKey}`);

    const config = this.prompts.getDocumentConfig(documentKey);
    if (!config) throw new NotFoundException(`Pas de prompt configuré pour: ${documentKey}`);

    const project = await this.prompts.getProjectData(projectId);
    if (!project) throw new NotFoundException('Projet introuvable');

    const prompt = config.buildPrompt(project);

    let response;
    try {
      response = await this.llm.generate(prompt, { temperature: 0.5, maxTokens: 2000 });
    } catch (error: any) {
      this.logger.error(`AI generation failed for ${documentKey}: ${error.message}`);
      response = {
        content: `Document généré en mode dégradé. Le contenu sera complet lorsque le service IA sera configuré.`,
        model: 'fallback',
      };
    }

    const existingDoc = await (this.prisma as any).generatedDocument.findUnique({
      where: {
        project_id_document_key: { project_id: projectId, document_key: documentKey },
      },
    });

    const isUpdate = existingDoc && existingDoc.status === 'GENERATED';

    const saved = await (this.prisma as any).generatedDocument.upsert({
      where: {
        project_id_document_key: { project_id: projectId, document_key: documentKey },
      },
      create: {
        project_id: projectId,
        document_key: documentKey,
        title: def.title,
        status: 'GENERATED',
        content: response.content,
        generated_at: new Date(),
      },
      update: {
        content: response.content,
        status: isUpdate ? 'UPDATED' : 'GENERATED',
        generated_at: new Date(),
      },
    });

    await this.prisma.aiInteraction.create({
      data: {
        project_id: projectId,
        step_key: `doc_${documentKey}`,
        prompt: `Génération du document "${def.title}"`,
        response: response.content,
        model: response.model || 'llama-3.3-70b-versatile',
      },
    });

    const isNew = !isUpdate;
    const eventName = isNew ? NotificationEvent.DOCUMENT_GENERATED : NotificationEvent.DOCUMENT_UPDATED;
    const { title, message } = isNew
      ? this.messageBuilder.documentGenerated({ title: def.title })
      : this.messageBuilder.documentUpdated({ title: def.title });

    this.eventEmitter.emit(
      eventName,
      {
        event: eventName,
        recipients: [{ userId }],
        title,
        message,
        link: `/project-owner/projects/${projectId}/documents`,
        senderId: userId,
        resourceType: 'PROJECT',
        resourceId: projectId,
      } as NotificationPayload,
    );

    return {
      key: saved.document_key,
      title: saved.title,
      status: saved.status,
      generatedAt: saved.generated_at,
      content: saved.content,
    };
  }

  async generateAllDocuments(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const results: any[] = [];
    for (const def of DOCUMENT_DEFINITIONS) {
      try {
        const result = await this.generateDocument(projectId, def.key, userId);
        results.push(result);
      } catch (error: any) {
        this.logger.warn(`Failed to generate ${def.key}: ${error.message}`);
        results.push({ key: def.key, title: def.title, status: 'ERROR', error: error.message });
      }
    }
    return results;
  }
}
