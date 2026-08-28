import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import PDFDocument from 'pdfkit';

interface BmcBlock {
  title: string;
  icon: string;
  color: string;
  fields: { label: string; value: string }[];
}

@Injectable()
export class BmcPdfService {
  private readonly logger = new Logger(BmcPdfService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
  ) {}

  async generate(projectId: string, userId: string): Promise<Buffer> {
    await this.access.assertCanAccessProject(projectId, userId);
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const data = await this.gatherData(projectId);
    return this.buildPdf(project, data);
  }

  private async gatherData(projectId: string) {
    const prisma = this.prisma as any;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        idea_sketch: true,
        problems_needs: true,
        pestel: true,
        objective: true,
        mission_vision: true,
        context_summary: true,
        stakeholder: true,
        stakeholder_map: true,
        customer_segment: true,
        value_proposition: true,
        value_proposition_pivot: true,
        customer_relations_channel: true,
        customer_journey: true,
        key_activities_resource: true,
        eco_design: true,
        eco_design_result: true,
        summary_activity: true,
        cost_structure: true,
        revenue_stream: true,
        cost_revenue_summary: true,
        test_preparation: true,
        indicator: true,
        test_discovery: true,
      },
    });

    return project;
  }

  private buildPdf(project: any, data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 25,
        info: {
          Title: `BMC - ${project.name}`,
          Author: 'Toolbox Vert',
          Subject: 'Business Model Canvas',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const green = '#2d7a52';
      const ink = '#1a1a2e';
      const ink2 = '#52525b';

      const ml = 25;
      const mt = 20;
      const pw = doc.page.width - 50;
      const ph = doc.page.height - 50;

      // ─── HEADER ───
      doc.fillColor(green).fontSize(8).font('Helvetica-Bold')
        .text('BUSINESS MODEL CANVAS', ml, mt);
      doc.fillColor(ink).fontSize(12).font('Helvetica-Bold')
        .text(project.name, ml, mt + 14);
      doc.fillColor(ink2).fontSize(7).font('Helvetica')
        .text(
          `Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          ml + 280, mt + 2,
        );

      // ─── CANVAS GRID ───
      const cx = ml;
      const cy = mt + 36;
      const cw = pw;
      const ch = ph - 40;

      const gap = 4;
      const colW = (cw - gap * 2) / 3;

      const x1 = cx;
      const x2 = cx + colW + gap;
      const x3 = x2 + colW + gap;

      const topH = ch * 0.34;
      const midH = ch * 0.16;
      const botH = ch - topH - midH * 2;

      const y1 = cy;
      const y2 = cy + topH;
      const y3 = y2 + midH;
      const y4 = y3 + midH;

      const pad = 6;
      const headerH = 16;

      const bmcBlocks = this.getBmcBlocks(data);
      const blocks: Record<number, any> = {};
      bmcBlocks.forEach((b, i) => { blocks[i + 1] = b; });

      const drawBox = (x: number, y: number, w: number, h: number, color: string, title: string, fields: { label: string; value: string }[]) => {
        doc.roundedRect(x, y, w, h, 3).fillColor('#fff').fill();
        doc.roundedRect(x, y, w, h, 3).strokeColor('#dee2e6').stroke();

        doc.rect(x + 0.5, y + 0.5, w - 1, headerH).fillColor(color).fill();
        doc.fillColor('#fff').fontSize(7.5).font('Helvetica-Bold')
          .text(title, x + pad, y + 4, { width: w - pad * 2 });

        const textY = y + headerH + 3;
        const textH = h - headerH - 6;
        const textW = w - pad * 2;

        if (textH > 10) {
          let ty = textY;
          const fontSize = 6.5;
          const lineH = fontSize * 1.35;

          for (const field of fields) {
            if (ty + lineH > y + h - 3) break;

            doc.fillColor(color).fontSize(6).font('Helvetica-Bold')
              .text(field.label + ':', x + pad, ty, { width: textW, continued: false });
            ty += lineH;

            if (ty + lineH > y + h - 3) break;
            const val = field.value || '—';
            const maxLen = Math.floor(textW / (fontSize * 0.5));
            const truncated = val.length > maxLen ? val.substring(0, maxLen - 3) + '...' : val;

            doc.fillColor(ink).fontSize(fontSize).font('Helvetica')
              .text(truncated, x + pad, ty, { width: textW });
            ty += doc.heightOfString(truncated, { width: textW }) + 1;
          }
        }
      };

      const getBlockContent = (index: number): { label: string; value: string }[] => {
        const block = blocks[index];
        if (!block || !block.fields) return [];
        return block.fields.slice(0, 8);
      };

      // Top row
      drawBox(x1, y1, colW, topH, '#06b6d4', '8. Partenaires clés', getBlockContent(8));
      drawBox(x2, y1, colW, topH / 2 - gap / 2, '#f97316', '7. Activités clés', getBlockContent(7));
      drawBox(x2, y1 + topH / 2 + gap / 2, colW, topH / 2 - gap / 2, '#f97316', '6. Ressources clés', getBlockContent(6));
      drawBox(x3, y1, colW, topH, '#8b5cf6', '2. Proposition de valeur', getBlockContent(2));

      // Middle row
      drawBox(cx, y2, cw, midH, '#f59e0b', '4. Relations clients', getBlockContent(4));
      drawBox(cx, y3, cw, midH, '#0ea5e9', '3. Canaux', getBlockContent(3));

      // Bottom row
      drawBox(x1, y4, colW, botH, '#6366f1', '9. Structure de coûts', getBlockContent(9));
      drawBox(x2, y4, colW, botH, '#4a7db5', '1. Segments de clientèle', getBlockContent(1));
      drawBox(x3, y4, colW, botH, '#10b981', '5. Flux de revenus', getBlockContent(5));

      // ─── FOOTER ───
      doc.fontSize(7).font('Helvetica').fillColor(ink2)
        .text(`BMC — ${project.name} — 1/1`, ml, doc.page.height - 18, { width: pw, align: 'center' });

      doc.end();
    });
  }

  private getBmcBlocks(data: any): BmcBlock[] {
    const vp = data.value_proposition;
    const crc = data.customer_relations_channel;
    const kar = data.key_activities_resource;
    const cs = data.cost_structure;
    const rs = data.revenue_stream;
    const crs = data.cost_revenue_summary;
    const sa = data.summary_activity;

    const fmt = (val: any) => val || '—';

    return [
      {
        title: '1. Segments de clientèle',
        icon: '👥',
        color: '#4a7db5',
        fields: this.formatManyToOne(data.customer_segment, [
          { key: 'segment_name', label: 'Nom du segment' },
          { key: 'description', label: 'Description' },
          { key: 'pains', label: 'Souffrances' },
          { key: 'gains', label: 'Gains attendus' },
          { key: 'functions', label: 'Fonctions / besoins' },
        ], 'Aucun segment de clientèle défini.'),
      },
      {
        title: '2. Proposition de valeur',
        icon: '💡',
        color: '#8b5cf6',
        fields: [
          ...(vp ? [
            { label: 'Valeur environnementale', value: fmt(vp.environmental_value) },
            { label: 'Valeur sociale', value: fmt(vp.social_value) },
            { label: 'Soulagement des douleurs', value: fmt(vp.pain_relievers) },
            { label: 'Créateurs de gains', value: fmt(vp.gain_creators) },
            { label: 'Produits et services', value: fmt(vp.products_services) },
            { label: 'Valeur ajoutée', value: fmt(vp.value_added) },
            { label: "Valeur d'innovation", value: fmt(vp.innovation_value) },
          ] : [{ label: 'Proposition de valeur', value: '—' }]),
          ...(data.value_proposition_pivot && data.value_proposition_pivot.new_value_proposition
            ? [{ label: 'Nouvelle proposition (pivot)', value: fmt(data.value_proposition_pivot.new_value_proposition) }]
            : []),
        ],
      },
      {
        title: '3. Canaux',
        icon: '📡',
        color: '#0ea5e9',
        fields: crc ? [
          { label: 'Canaux', value: fmt(crc.channels) },
          { label: 'Stratégie de distribution', value: fmt(crc.distribution_strategy) },
        ] : [{ label: 'Canaux', value: '—' }],
      },
      {
        title: '4. Relations clients',
        icon: '🤝',
        color: '#f59e0b',
        fields: [
          ...(crc ? [{ label: 'Relations clients', value: fmt(crc.customer_relationships) }] : [{ label: 'Relations clients', value: '—' }]),
          ...this.formatManyToOne(data.customer_journey, [
            { key: 'stage_name', label: 'Étape parcours client' },
            { key: 'touchpoints', label: 'Points de contact' },
          ], ''),
        ],
      },
      {
        title: '5. Flux de revenus',
        icon: '💰',
        color: '#10b981',
        fields: rs ? [
          { label: 'Sources de revenus', value: fmt(rs.revenue_sources) },
          { label: 'Stratégie de prix', value: fmt(rs.pricing_strategy) },
          { label: 'Projections de revenus', value: fmt(rs.revenue_projections) },
          ...(crs?.revenue_summary ? [{ label: 'Résumé des revenus', value: fmt(crs.revenue_summary) }] : []),
          ...(crs?.financial_health ? [{ label: 'Santé financière', value: fmt(crs.financial_health) }] : []),
        ] : [{ label: 'Flux de revenus', value: '—' }],
      },
      {
        title: '6. Ressources clés',
        icon: '🔑',
        color: '#ef4444',
        fields: kar ? [
          { label: 'Ressources clés', value: fmt(kar.key_resources) },
        ] : [{ label: 'Ressources clés', value: '—' }],
      },
      {
        title: '7. Activités clés',
        icon: '⚡',
        color: '#f97316',
        fields: [
          ...(kar ? [{ label: 'Activités clés', value: fmt(kar.key_activities) }] : []),
          ...(sa ? [
            { label: 'Résumé des activités', value: fmt(sa.activities_summary) },
            { label: 'Réalisations clés', value: fmt(sa.key_achievements) },
          ] : []),
          ...(data.test_preparation ? [
            { label: 'Objectifs de test', value: fmt(data.test_preparation.test_objectives) },
          ] : []),
        ],
      },
      {
        title: '8. Partenaires clés',
        icon: '🤝',
        color: '#06b6d4',
        fields: [
          ...this.formatManyToOne(data.stakeholder, [
            { key: 'name', label: 'Partie prenante' },
            { key: 'role', label: 'Rôle' },
            { key: 'interest', label: 'Intérêt' },
          ], ''),
          ...this.formatManyToOne(data.stakeholder_map, [
            { key: 'stakeholder_name', label: 'Partie prenante' },
            { key: 'contribution', label: 'Contribution' },
          ], ''),
          ...(kar?.strategic_partners ? [{ label: 'Partenaires stratégiques', value: fmt(kar.strategic_partners) }] : []),
        ].filter(f => f.value && f.value !== '—' && f.value !== ''),
      },
      {
        title: '9. Structure de coûts',
        icon: '📊',
        color: '#6366f1',
        fields: cs ? [
          { label: 'Coûts fixes', value: fmt(cs.fixed_costs) },
          { label: 'Coûts variables', value: fmt(cs.variable_costs) },
          { label: 'Facteurs de coûts', value: fmt(cs.cost_drivers) },
          { label: 'Seuil de rentabilité', value: fmt(cs.breakeven_analysis) },
          ...(crs?.cost_summary ? [{ label: 'Résumé des coûts', value: fmt(crs.cost_summary) }] : []),
        ] : [{ label: 'Structure de coûts', value: '—' }],
      },
    ];
  }

  private getExtraSections(data: any): { title: string; fields: { label: string; value: string }[] }[] {
    const is = data.idea_sketch;
    const pn = data.problems_needs;
    const mv = data.mission_vision;
    const ed = data.eco_design;
    const edr = data.eco_design_result;

    const sections: { title: string; fields: { label: string; value: string }[] }[] = [];

    if (is) {
      sections.push({
        title: 'Idée d\'entreprise',
        fields: [
          { label: 'Idée initiale', value: is.idea_initial || '—' },
          { label: 'Produit / Service', value: is.product_service || '—' },
          { label: 'Clients cibles', value: is.customers || '—' },
          { label: 'Partenaires', value: is.partners || '—' },
        ],
      });
    }

    if (pn) {
      sections.push({
        title: 'Problèmes & Besoins',
        fields: [
          { label: 'Défis environnementaux', value: pn.environmental_challenges || '—' },
          { label: 'Défis sociaux', value: pn.social_challenges || '—' },
          { label: 'Besoins clients', value: pn.customer_needs || '—' },
          { label: 'Motivations d\'équipe', value: pn.team_motivations || '—' },
        ],
      });
    }

    if (mv) {
      sections.push({
        title: 'Mission & Vision',
        fields: [
          { label: 'Mission', value: mv.mission || '—' },
          { label: 'Vision', value: mv.vision || '—' },
          { label: 'Valeurs', value: mv.values || '—' },
        ],
      });
    }

    if (data.objective) {
      const obj = data.objective;
      sections.push({
        title: 'Objectifs',
        fields: [
          { label: 'Objectifs environnementaux', value: obj.environmental_objectives || '—' },
          { label: 'Objectifs sociaux', value: obj.social_objectives || '—' },
          { label: 'Objectifs clients', value: obj.customer_objectives || '—' },
          { label: "Objectifs d'équipe", value: obj.team_objectives || '—' },
        ],
      });
    }

    if (data.pestel) {
      const p = data.pestel;
      sections.push({
        title: 'Analyse PESTEL',
        fields: [
          { label: 'Politique', value: p.political_what && p.political_how ? `${p.political_what} — ${p.political_how}` : '—' },
          { label: 'Économique', value: p.economic_what && p.economic_how ? `${p.economic_what} — ${p.economic_how}` : '—' },
          { label: 'Social', value: p.social_what && p.social_how ? `${p.social_what} — ${p.social_how}` : '—' },
          { label: 'Technologique', value: p.technological_what && p.technological_how ? `${p.technological_what} — ${p.technological_how}` : '—' },
          { label: 'Environnemental', value: p.environmental_what && p.environmental_how ? `${p.environmental_what} — ${p.environmental_how}` : '—' },
          { label: 'Légal', value: p.legal_what && p.legal_how ? `${p.legal_what} — ${p.legal_how}` : '—' },
        ],
      });
    }

    if (ed) {
      sections.push({
        title: 'Écoconception',
        fields: [
          { label: 'Équipe éco-conception', value: ed.equipe_eco || '—' },
          { label: 'Projet — cycle de vie', value: ed.projet_eco || '—' },
          { label: 'Contexte environnemental', value: ed.contexte_eco || '—' },
          { label: 'Vision durable', value: ed.vision_durable || '—' },
        ],
      });
    }

    if (edr) {
      sections.push({
        title: 'Résultats de l\'écoconception',
        fields: [
          { label: 'Résultats', value: edr.eco_results || '—' },
          { label: 'Analyse de performance', value: edr.performance_analysis || '—' },
          { label: 'Pistes d\'amélioration', value: edr.improvements || '—' },
        ],
      });
    }

    if (data.test_discovery && data.test_discovery.length > 0) {
      const tests = data.test_discovery
        .filter((t: any) => t.hypothesis)
        .map((t: any) => `• Hypothèse : ${t.hypothesis}${t.results ? `\n  Résultat : ${t.results}` : ''}${t.learnings ? `\n  Apprentissage : ${t.learnings}` : ''}`)
        .join('\n\n');
      if (tests) {
        sections.push({
          title: 'Tests & Découvertes',
          fields: [{ label: 'Tests effectués', value: tests }],
        });
      }
    }

    return sections;
  }

  private getMonitoringSections(data: any): { title: string; fields: { label: string; value: string }[] }[] {
    const ind = data.indicator;
    const tp = data.test_preparation;

    const sections: { title: string; fields: { label: string; value: string }[] }[] = [];

    if (tp) {
      sections.push({
        title: 'Préparation des tests',
        fields: [
          { label: 'Objectifs de test', value: tp.test_objectives || '—' },
          { label: 'Méthode de test', value: tp.test_method || '—' },
          { label: 'Critères de succès', value: tp.success_criteria || '—' },
          { label: 'Ressources nécessaires', value: tp.resources_needed || '—' },
          { label: 'Calendrier', value: tp.timeline || '—' },
        ],
      });
    }

    if (ind) {
      sections.push({
        title: 'Indicateurs de performance (KPIs)',
        fields: [
          { label: 'KPIs environnementaux', value: ind.environmental_kpis || '—' },
          { label: 'KPIs sociaux', value: ind.social_kpis || '—' },
          { label: 'KPIs économiques', value: ind.economic_kpis || '—' },
          { label: 'Méthode de mesure', value: ind.measurement_method || '—' },
          { label: 'Fréquence de révision', value: ind.review_frequency || '—' },
        ],
      });
    }

    return sections;
  }

  private formatManyToOne(
    items: any[] | undefined | null,
    fieldMappings: { key: string; label: string }[],
    emptyText: string,
  ): { label: string; value: string }[] {
    if (!items || items.length === 0) {
      return emptyText ? [{ label: emptyText, value: '' }] : [];
    }

    const result: { label: string; value: string }[] = [];
    for (const item of items) {
      for (const fm of fieldMappings) {
        if (item[fm.key]) {
          result.push({
            label: `${fm.label}`,
            value: item[fm.key] || '—',
          });
        }
      }
    }

    return result;
  }
}
