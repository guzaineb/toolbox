import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm.service';
import { ProjectContextBuilderService } from './project-context.service';
import { asString, asStringArray, parseWithRetry } from './ai-json.util';

export interface JuryAssistantPayload {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  suggestedQuestions: string[];
  missingInformation: string[];
  inconsistencies: string[];
}

/**
 * Assistant IA du jury : prépare la lecture du projet mais ne propose JAMAIS de note.
 */
@Injectable()
export class JuryAiService {
  constructor(
    private readonly llm: LlmService,
    private readonly contextBuilder: ProjectContextBuilderService,
  ) {}

  async buildBriefing(projectId: string): Promise<JuryAssistantPayload | null> {
    const context = await this.contextBuilder.build(projectId);
    if (!context.contextText) return null;

    const prompt = `Prépare le dossier de lecture pour un jury qui va évaluer le projet « ${context.projectName} ».

=== DOSSIER DU PROJET ===
${context.contextText}

Produis UNIQUEMENT un JSON strict :
{
  "summary": "synthèse neutre du projet en 3-4 phrases",
  "strengths": ["points forts factuels"],
  "weaknesses": ["points faibles factuels"],
  "risks": ["risques identifiés dans les données"],
  "suggestedQuestions": ["questions pertinentes à poser au porteur"],
  "missingInformation": ["informations attendues mais absentes du dossier"],
  "inconsistencies": ["incohérences détectées entre les données"]
}
IMPORTANT : tu ne proposes AUCUNE note ni score — c'est le rôle exclusif du jury.`;

    const result = await parseWithRetry<JuryAssistantPayload>(
      () =>
        this.llm
          .chat(
            [
              {
                role: 'system',
                content:
                  "Tu prépares des dossiers d'évaluation pour des jurys. Tu cites uniquement les données fournies, sans jamais proposer de note. Réponds UNIQUEMENT en JSON.",
              },
              { role: 'user', content: prompt },
            ],
            { temperature: 0.3, maxTokens: 2000 },
          )
          .then((r) => r.content),
      (parsed) => this.validate(parsed),
    );

    return result.data;
  }

  validate(value: unknown): JuryAssistantPayload | null {
    if (!value || typeof value !== 'object') return null;
    const obj = value as Record<string, unknown>;
    const summary = asString(obj.summary);
    if (!summary) return null;
    return {
      summary,
      strengths: asStringArray(obj.strengths).slice(0, 6),
      weaknesses: asStringArray(obj.weaknesses).slice(0, 6),
      risks: asStringArray(obj.risks).slice(0, 6),
      suggestedQuestions: asStringArray(obj.suggestedQuestions).slice(0, 8),
      missingInformation: asStringArray(obj.missingInformation).slice(0, 6),
      inconsistencies: asStringArray(obj.inconsistencies).slice(0, 6),
    };
  }
}
