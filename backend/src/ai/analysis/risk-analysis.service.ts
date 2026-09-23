import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmService } from '../llm.service';
import { ProjectContextBuilderService } from './project-context.service';
import { asString, parseWithRetry } from './ai-json.util';

export interface RiskItem {
  category: string;
  severity: string;
  description: string;
  evidence: string | null;
  recommendedAction: string | null;
}

export interface RiskAnalysisPayload {
  overallLevel: string;
  risks: RiskItem[];
}

const CATEGORIES = ['market', 'financial', 'execution', 'team', 'impact', 'innovation'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH'];

@Injectable()
export class RiskAnalysisService {
  private readonly logger = new Logger(RiskAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly contextBuilder: ProjectContextBuilderService,
  ) {}

  async analyze(projectId: string, userId: string): Promise<RiskAnalysisPayload | null> {
    const context = await this.contextBuilder.build(projectId);
    if (!context.contextText) return null;

    const prompt = `Analyse les risques du projet « ${context.projectName} » à partir des données réelles ci-dessous.

=== DONNÉES PROJET ===
${context.contextText}

Produis UNIQUEMENT un JSON strict :
{
  "overallLevel": "LOW|MEDIUM|HIGH",
  "risks": [
    {
      "category": "market|financial|execution|team|impact|innovation",
      "severity": "LOW|MEDIUM|HIGH",
      "description": "...",
      "evidence": "donnée précise du projet qui justifie ce risque (ou null si absence d'information)",
      "recommendedAction": "action concrète pour réduire ce risque"
    }
  ]
}
Contraintes : 2 à 6 risques ; ne jamais inventer une information absente — utiliser le champ evidence pour signaler l'absence de donnée.`;

    const result = await parseWithRetry<RiskAnalysisPayload>(
      () =>
        this.llm.chat(
          [
            {
              role: 'system',
              content:
                "Tu es un analyste de risques de projets entrepreneuriaux. Tu ne t'appuies que sur les données fournies et réponds UNIQUEMENT en JSON.",
            },
            { role: 'user', content: prompt },
          ],
          { temperature: 0.3, maxTokens: 1800 },
        ).then((r) => r.content),
      (parsed) => this.validate(parsed),
    );

    const payload = result.data;
    if (!payload) return null;

    await this.prisma.aiAnalysis
      .create({
        data: {
          project_id: projectId,
          type: 'RISK_ANALYSIS',
          status: 'COMPLETED',
          payload: payload as unknown as Prisma.InputJsonValue,
          created_by: userId,
        },
      })
      .catch(() => undefined);

    return payload;
  }

  validate(value: unknown): RiskAnalysisPayload | null {
    if (!value || typeof value !== 'object') return null;
    const obj = value as Record<string, unknown>;
    const level = (asString(obj.overallLevel) ?? 'MEDIUM').toUpperCase();
    if (!Array.isArray(obj.risks)) return null;
    const risks = obj.risks
      .map((item): RiskItem | null => {
        if (!item || typeof item !== 'object') return null;
        const r = item as Record<string, unknown>;
        const description = asString(r.description);
        if (!description) return null;
        const category = (asString(r.category) ?? 'execution').toLowerCase();
        const severity = (asString(r.severity) ?? 'MEDIUM').toUpperCase();
        return {
          category: CATEGORIES.includes(category) ? category : 'execution',
          severity: SEVERITIES.includes(severity) ? severity : 'MEDIUM',
          description: description.slice(0, 600),
          evidence: asString(r.evidence),
          recommendedAction: asString(r.recommendedAction)?.slice(0, 400) ?? null,
        };
      })
      .filter((r): r is RiskItem => r !== null)
      .slice(0, 6);
    if (risks.length === 0) return null;
    return {
      overallLevel: SEVERITIES.includes(level) ? level : 'MEDIUM',
      risks,
    };
  }
}
