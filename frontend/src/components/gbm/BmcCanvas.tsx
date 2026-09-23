'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Layers, Loader2 } from 'lucide-react'
import { gbmService } from '@/services/gbm.service'
import { ErrorAlert } from '@/components/shared/ui'
import { getErrorMessage } from '@/lib/utils'

interface BmcField {
  label: string
  value: string
}

interface BmcBlock {
  title: string
  color: string
  fields: BmcField[]
}

type GbmBmcData = Record<string, unknown>

const fmt = (v: unknown): string => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) {
    return v
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') {
          return Object.entries(item as Record<string, unknown>)
            .map(([k, val]) => `${k}: ${String(val ?? '')}`)
            .join(', ')
        }
        return String(item)
      })
      .join('\n')
  }
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k} : ${fmt(val)}`)
      .join('\n')
  }
  return String(v)
}

const obj = (data: GbmBmcData, path: string): Record<string, unknown> | null => {
  const v = data[path]
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null
}

const arr = (data: GbmBmcData, path: string): Record<string, unknown>[] =>
  Array.isArray(data[path]) ? (data[path] as Record<string, unknown>[]) : []

const fromItems = (
  items: Record<string, unknown>[],
  mappings: { key: string; label: string }[],
): BmcField[] => {
  const out: BmcField[] = []
  for (const item of items) {
    for (const m of mappings) {
      const v = fmt(item[m.key])
      if (v) out.push({ label: m.label, value: v })
    }
  }
  return out
}

function buildBlocks(data: GbmBmcData): BmcBlock[] {
  const vp = obj(data, 'value_proposition')
  const pivot = obj(data, 'value_proposition_pivot')
  const crc = obj(data, 'customer_relations_channel')
  const kar = obj(data, 'key_activities_resource')
  const cs = obj(data, 'cost_structure')
  const rs = obj(data, 'revenue_stream')
  const crs = obj(data, 'cost_revenue_summary')
  const sa = obj(data, 'summary_activity')
  const tp = obj(data, 'test_preparation')

  const blocks: BmcBlock[] = []

  blocks.push({
    title: '1. Segments de clientèle',
    color: '#4a7db5',
    fields: fromItems(arr(data, 'customer_segment'), [
      { key: 'segment_name', label: 'Nom du segment' },
      { key: 'description', label: 'Description' },
      { key: 'pains', label: 'Souffrances' },
      { key: 'gains', label: 'Gains attendus' },
      { key: 'functions', label: 'Fonctions / besoins' },
    ]),
  })

  blocks.push({
    title: '2. Proposition de valeur',
    color: '#8b5cf6',
    fields: [
      ...(vp
        ? [
            { label: 'Valeur environnementale', value: fmt(vp.environmental_value) },
            { label: 'Valeur sociale', value: fmt(vp.social_value) },
            { label: 'Soulagement des douleurs', value: fmt(vp.pain_relievers) },
            { label: 'Créateurs de gains', value: fmt(vp.gain_creators) },
            { label: 'Produits et services', value: fmt(vp.products_services) },
            { label: 'Valeur ajoutée', value: fmt(vp.value_added) },
            { label: "Valeur d'innovation", value: fmt(vp.innovation_value) },
          ]
        : []),
      ...(pivot ? [{ label: 'Nouvelle proposition (pivot)', value: fmt(pivot.new_value_proposition) }] : []),
    ].filter((f) => f.value),
  })

  blocks.push({
    title: '3. Canaux',
    color: '#0ea5e9',
    fields: crc
      ? [
          { label: 'Canaux', value: fmt(crc.channels) },
          { label: 'Stratégie de distribution', value: fmt(crc.distribution_strategy) },
        ].filter((f) => f.value)
      : [],
  })

  blocks.push({
    title: '4. Relations clients',
    color: '#f59e0b',
    fields: [
      ...(crc ? [{ label: 'Relations clients', value: fmt(crc.customer_relationships) }] : []),
      ...fromItems(arr(data, 'customer_journey'), [
        { key: 'stage_name', label: 'Étape parcours client' },
        { key: 'touchpoints', label: 'Points de contact' },
      ]),
    ].filter((f) => f.value),
  })

  blocks.push({
    title: '5. Flux de revenus',
    color: '#10b981',
    fields: [
      ...(rs
        ? [
            { label: 'Sources de revenus', value: fmt(rs.revenue_sources) },
            { label: 'Stratégie de prix', value: fmt(rs.pricing_strategy) },
            { label: 'Projections de revenus', value: fmt(rs.revenue_projections) },
          ]
        : []),
      ...(crs ? [{ label: 'Résumé des revenus', value: fmt(crs.revenue_summary) }] : []),
      ...(crs ? [{ label: 'Santé financière', value: fmt(crs.financial_health) }] : []),
    ].filter((f) => f.value),
  })

  blocks.push({
    title: '6. Ressources clés',
    color: '#ef4444',
    fields: kar ? [{ label: 'Ressources clés', value: fmt(kar.key_resources) }].filter((f) => f.value) : [],
  })

  blocks.push({
    title: '7. Activités clés',
    color: '#f97316',
    fields: [
      ...(kar ? [{ label: 'Activités clés', value: fmt(kar.key_activities) }] : []),
      ...(sa ? [{ label: 'Résumé des activités', value: fmt(sa.activities_summary) }] : []),
      ...(sa ? [{ label: 'Réalisations clés', value: fmt(sa.key_achievements) }] : []),
      ...(tp ? [{ label: 'Objectifs de test', value: fmt(tp.test_objectives) }] : []),
    ].filter((f) => f.value),
  })

  blocks.push({
    title: '8. Partenaires clés',
    color: '#06b6d4',
    fields: [
      ...fromItems(arr(data, 'stakeholder'), [
        { key: 'name', label: 'Partie prenante' },
        { key: 'role', label: 'Rôle' },
        { key: 'interest', label: 'Intérêt' },
      ]),
      ...fromItems(arr(data, 'stakeholder_map'), [
        { key: 'stakeholder_name', label: 'Partie prenante' },
        { key: 'contribution', label: 'Contribution' },
      ]),
      ...(kar ? [{ label: 'Partenaires stratégiques', value: fmt(kar.strategic_partners) }] : []),
    ].filter((f) => f.value),
  })

  blocks.push({
    title: '9. Structure de coûts',
    color: '#6366f1',
    fields: [
      ...(cs
        ? [
            { label: 'Coûts fixes', value: fmt(cs.fixed_costs) },
            { label: 'Coûts variables', value: fmt(cs.variable_costs) },
            { label: 'Facteurs de coûts', value: fmt(cs.cost_drivers) },
            { label: 'Seuil de rentabilité', value: fmt(cs.breakeven_analysis) },
          ]
        : []),
      ...(crs ? [{ label: 'Résumé des coûts', value: fmt(crs.cost_summary) }] : []),
    ].filter((f) => f.value),
  })

  return blocks
}

// Ordre d'affichage proche du canevas classique (3 colonnes × 3 rangées).
const LAYOUT_ORDER = [8, 7, 2, 6, 4, 3, 9, 1, 5]

export function BmcCanvas({ projectId }: { projectId: string }) {
  const [data, setData] = useState<GbmBmcData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const blocks = useMemo(() => buildBlocks(data ?? {}), [data])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await gbmService.getBmcData(projectId)
      setData(result as GbmBmcData)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers size={15} className="text-moss" />
        <h2 className="text-sm font-bold text-ink font-syne">Business Model Canvas</h2>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={20} className="animate-spin text-moss" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LAYOUT_ORDER.map((idx) => {
            const block = blocks[idx - 1]
            if (!block) return null
            const filled = block.fields.length
            return (
              <div
                key={block.title}
                className="rounded-lg border border-border bg-surface overflow-hidden flex flex-col"
              >
                <div
                  className="flex items-center justify-between px-3 py-2"
                  style={{ backgroundColor: block.color }}
                >
                  <span className="text-[11px] font-bold text-white font-syne">{block.title}</span>
                  {filled === 0 && (
                    <span className="text-[9px] text-white/80 font-dm">—</span>
                  )}
                </div>
                <div className="p-3 space-y-1.5 flex-1">
                  {filled === 0 ? (
                    <p className="text-xs text-ink3 font-dm">Non renseigné</p>
                  ) : (
                    block.fields.slice(0, 6).map((f, i) => (
                      <div key={i} className="text-xs font-dm">
                        <span className="font-semibold text-ink2">{f.label} : </span>
                        <span className="text-ink whitespace-pre-line line-clamp-4">{f.value}</span>
                      </div>
                    ))
                  )}
                  {filled > 6 && (
                    <p className="text-[10px] text-ink3 font-dm pt-1">
                      +{filled - 6} élément{filled - 6 > 1 ? 's' : ''} supplémentaires — voir le PDF
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}