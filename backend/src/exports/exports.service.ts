import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JourneyService } from '../journey/journey.service';
import { BmcService } from '../bmc/bmc.service';
import { ReviewsService } from '../reviews/reviews.service';

@Injectable()
export class ExportsService {
  constructor(
    private journeyService: JourneyService,
    private bmcService: BmcService,
    private reviewsService: ReviewsService,
  ) {}

  async exportJson(projectId: string): Promise<any> {
    const [steps, bmc, reviews] = await Promise.all([
      this.journeyService.getSteps(projectId),
      this.bmcService.getBmc(projectId),
      this.reviewsService.findByProject(projectId).catch(() => []),
    ]);

    return {
      exported_at: new Date().toISOString(),
      project_id: projectId,
      steps: steps.map(s => ({
        step_number: s.step_number,
        title: s.title,
        status: s.status,
        content: s.content,
        sub_sections: s.sub_sections,
        score: s.score,
        submitted_at: s.submitted_at,
      })),
      bmc: bmc ? bmc.blocks : null,
      reviews: reviews.map(r => ({
        content: r.content,
        scores: {
          innovation: r.innovation_score,
          faisability: r.faisability_score,
          market: r.market_score,
          team: r.team_score,
          business_model: r.business_model_score,
        },
        created_at: r.created_at,
      })),
    };
  }

  async exportPdf(projectId: string): Promise<Buffer> {
    const data = await this.exportJson(projectId);
    const html = this.generateHtml(data);
    return Buffer.from(html, 'utf-8');
  }

  async exportHtml(projectId: string): Promise<string> {
    const data = await this.exportJson(projectId);
    return this.generateHtml(data);
  }

  async exportMarkdown(projectId: string): Promise<string> {
    const data = await this.exportJson(projectId);
    let md = `# Rapport du Projet\n\n`;
    md += `Exporté le: ${data.exported_at}\n\n`;
    md += `## Étapes\n\n`;

    for (const step of data.steps) {
      md += `### Étape ${step.step_number}: ${step.title}\n`;
      md += `**Statut:** ${step.status}\n`;
      if (step.score !== null) md += `**Score:** ${step.score}/100\n`;
      md += `\n`;
      if (step.content) {
        for (const [key, value] of Object.entries(step.content)) {
          md += `**${key}:**\n`;
          if (typeof value === 'object') {
            for (const [q, a] of Object.entries(value as any)) {
              if (a && a !== '') md += `- ${q}: ${a}\n`;
            }
          } else if (value && value !== '') {
            md += `${value}\n`;
          }
          md += `\n`;
        }
      }
    }

    if (data.bmc) {
      md += `## Business Model Canvas\n\n`;
      for (const [block, content] of Object.entries(data.bmc)) {
        md += `**${block}:** ${content}\n\n`;
      }
    }

    return md;
  }

  async exportCsv(projectId: string): Promise<string> {
    const data = await this.exportJson(projectId);
    let csv = 'step_number,title,status,score\n';
    for (const step of data.steps) {
      const score = step.score ?? '';
      csv += `${step.step_number},"${step.title}",${step.status},${score}\n`;
    }
    return csv;
  }

  private generateHtml(data: any): string {
    let stepsHtml = '';
    for (const step of data.steps) {
      let contentHtml = '';
      if (step.content) {
        contentHtml = '<div class="step-content">';
        for (const [key, value] of Object.entries(step.content)) {
          contentHtml += `<h4>${this.escapeHtml(key)}</h4>`;
          if (typeof value === 'object' && value !== null) {
            contentHtml += '<ul>';
            for (const [q, a] of Object.entries(value as any)) {
              if (a && a !== '') {
                contentHtml += `<li><strong>${this.escapeHtml(q)}:</strong> ${this.escapeHtml(String(a))}</li>`;
              }
            }
            contentHtml += '</ul>';
          } else if (value && value !== '') {
            contentHtml += `<p>${this.escapeHtml(String(value))}</p>`;
          }
        }
        contentHtml += '</div>';
      }

      stepsHtml += `
        <div class="step">
          <h3>Étape ${step.step_number}: ${this.escapeHtml(step.title)}</h3>
          <div class="step-meta">
            <span class="status status-${step.status}">${step.status}</span>
            ${step.score !== null ? `<span class="score">Score: ${step.score}/100</span>` : ''}
          </div>
          ${contentHtml}
        </div>
      `;
    }

    let bmcHtml = '';
    if (data.bmc) {
      bmcHtml = '<div class="bmc"><h2>Business Model Canvas</h2><div class="bmc-grid">';
      for (const [block, content] of Object.entries(data.bmc)) {
        bmcHtml += `<div class="bmc-block"><h4>${this.escapeHtml(block)}</h4><p>${this.escapeHtml(String(content || ''))}</p></div>`;
      }
      bmcHtml += '</div></div>';
    }

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rapport du Projet</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e; }
  h1 { font-size: 28px; border-bottom: 3px solid #2d7a52; padding-bottom: 10px; }
  .step { background: #f8faf8; border-radius: 10px; padding: 20px; margin: 16px 0; border: 1px solid #e2e8e2; }
  .step h3 { color: #2d7a52; margin: 0 0 8px 0; }
  .step-meta { display: flex; gap: 12px; margin-bottom: 12px; font-size: 13px; }
  .status { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .status-approved { background: #d4edda; color: #155724; }
  .status-submitted { background: #fff3cd; color: #856404; }
  .status-rejected { background: #f8d7da; color: #721c24; }
  .status-in_progress { background: #cce5ff; color: #004085; }
  .status-not_started { background: #e2e3e5; color: #383d41; }
  .step-content h4 { color: #1a1a2e; margin: 12px 0 4px 0; font-size: 13px; text-transform: capitalize; }
  .step-content ul { margin: 0; padding-left: 20px; }
  .step-content li { font-size: 13px; margin: 4px 0; }
  .bmc { margin-top: 32px; }
  .bmc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .bmc-block { background: #f0f8f4; border: 1px solid #d4e8da; border-radius: 8px; padding: 14px; }
  .bmc-block h4 { margin: 0 0 6px 0; color: #2d7a52; text-transform: capitalize; font-size: 13px; }
  .bmc-block p { font-size: 12px; color: #4a5568; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8e2; font-size: 12px; color: #718096; }
</style></head>
<body>
  <h1>Rapport du Projet</h1>
  <p class="date">Exporté le: ${new Date(data.exported_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  <h2>Étapes (${data.steps.length})</h2>
  ${stepsHtml}
  ${bmcHtml}
  <div class="footer"><p>Généré par ToolBox - Plateforme de structuration de projets entrepreneuriaux</p></div>
</body>
</html>`;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
