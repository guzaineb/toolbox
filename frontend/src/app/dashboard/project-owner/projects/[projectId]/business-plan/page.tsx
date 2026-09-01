'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check, Sparkles, FileText } from 'lucide-react'
import { businessPlanService } from '@/services/business-plan.service'
import { Button, Card, CardHeader, Progress, ErrorAlert, SuccessAlert, TabNav } from '@/components/shared/ui'
import { AiSummaryBadge } from '@/components/shared/AiSummaryBadge'
import { applyPrefill, type ProvenanceInfo } from '@/hooks/useProjectPrefill'
import { DataProvenance } from '@/components/shared/DataProvenance'
import { MissingInfoCard } from '@/components/shared/MissingInfoCard'
import type { ChecklistItem } from '@/types/project-context'
import { projectContextService } from '@/services/project-context.service'

const SECTIONS = [
  { id: 'management', label: '2.1 Gestion' },
  { id: 'marketing',  label: '2.2 Marketing' },
  { id: 'financial',  label: '2.3 Financier' },
  { id: 'legal',      label: '2.4 Juridique' },
  { id: 'kpis',       label: '2.5 KPIs' },
  { id: 'summary',    label: '2.6 Résumé' },
]

const PREFILL_MODULES: Record<string, string> = {
  management: 'management',
  marketing: 'marketing',
  financial: 'financial',
}

export default function BusinessPlanPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [section, setSection] = useState('management')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<any>(null)
  const [genLoading, setGenLoading] = useState(false)
  const [provenance, setProvenance] = useState<Record<string, ProvenanceInfo>>({})
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getSectionData(section)
      const prefillModule = PREFILL_MODULES[section]
      if (prefillModule) {
        try {
          const prefill = await projectContextService.getPrefill(projectId, prefillModule)
          const merged = applyPrefill(data || {}, prefill)
          setFormData(merged.data)
          setProvenance(merged.provenance)
          setChecklist(prefill.checklist || [])
        } catch {
          setFormData(data || {})
          setProvenance({})
          setChecklist([])
        }
      } else {
        setFormData(data || {})
        setProvenance({})
        setChecklist([])
      }
      const p = await businessPlanService.getProgress(projectId)
      setProgress(p)
      setDirty(false)
    } catch {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [projectId, section])

  useEffect(() => { loadData() }, [loadData])

  const getSectionData = async (sectionId: string) => {
    switch (sectionId) {
      case 'management': return businessPlanService.getManagement(projectId)
      case 'marketing':  return businessPlanService.getMarketing(projectId)
      case 'financial':  return businessPlanService.getFinancial(projectId)
      case 'legal':      return businessPlanService.getLegal(projectId)
      case 'kpis':       return businessPlanService.getKpis(projectId)
      case 'summary':    return businessPlanService.getExecutiveSummary(projectId)
      default: return {}
    }
  }

  const handleSectionChange = (next: string) => {
    if (dirty && next !== section) {
      const ok = window.confirm(
        'Vous avez des modifications non sauvegardées dans cette section. Continuer sans sauvegarder ?',
      )
      if (!ok) return
    }
    setSection(next)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      switch (section) {
        case 'management': await businessPlanService.updateManagement(projectId, formData); break
        case 'marketing':  await businessPlanService.updateMarketing(projectId, formData); break
        case 'financial':  await businessPlanService.updateFinancial(projectId, formData); break
        case 'legal':      await businessPlanService.updateLegal(projectId, formData); break
        case 'kpis': {
          const payload: Record<string, unknown> = { ...formData }
          const raw = payload.kpis
          if (typeof raw === 'string') {
            const trimmed = raw.trim()
            if (trimmed) {
              try {
                payload.kpis = JSON.parse(trimmed)
              } catch {
                setError('Le champ KPIs doit contenir un objet JSON valide.')
                setSaving(false)
                return
              }
            } else {
              delete payload.kpis
            }
          }
          await businessPlanService.updateKpis(projectId, payload)
          break
        }
        case 'summary':    await businessPlanService.updateExecutiveSummary(projectId, formData); break
      }
      setSaved(true)
      setDirty(false)
      setTimeout(() => setSaved(false), 2000)
      const p = await businessPlanService.getProgress(projectId)
      setProgress(p)
    } catch {
      setError('Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerate = async () => {
    setGenLoading(true)
    try {
      const result = await businessPlanService.generateExecutiveSummary(projectId)
      setFormData({ resume_executif: result.resume_executif })
      setDirty(false)
    } catch {
      setError('Erreur de génération IA')
    } finally {
      setGenLoading(false)
    }
  }

  const fields = getSectionFields(section)

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 hover:bg-moss-light rounded-lg">
          <ArrowLeft size={18} className="text-ink3" />
        </button>
        <div>
          <h1 className="font-syne text-lg font-extrabold text-ink">Plan d&apos;Affaires Vert</h1>
          <p className="text-xs text-ink3">Étapes 2.1 à 2.6</p>
        </div>
        {progress && (
          <div className="ml-auto flex items-center gap-2">
            <Progress value={progress.percentage} />
            <span className="text-xs font-bold text-moss">{progress.percentage}%</span>
          </div>
        )}
      </div>

      <TabNav tabs={SECTIONS} active={section} onChange={handleSectionChange} />

      <Card className="p-0 overflow-hidden">
        <CardHeader
          icon={<FileText size={13} />}
          title={SECTIONS.find(s => s.id === section)?.label || ''}
        >
          {section === 'summary' && <AiSummaryBadge generated={formData?.generated_by_ai} />}
        </CardHeader>

        <div className="p-5">
          {error && <ErrorAlert message={error} className="mb-4" />}
          {saved && <SuccessAlert message="Sauvegardé ✓" className="mb-4" />}

          <MissingInfoCard checklist={checklist} />

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-moss" /></div>
          ) : (
            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-ink2 mb-1">{f.label}</label>
                  {f.type === 'json' ? (
                    <textarea
                      className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss min-h-[80px] resize-y font-mono"
                      value={jsonText(formData[f.key])}
                      onChange={e => { setDirty(true); setFormData((prev: any) => ({ ...prev, [f.key]: e.target.value })) }}
                      rows={6}
                      placeholder={f.placeholder}
                    />
                  ) : f.type === 'textarea' ? (
                    <textarea
                      className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss min-h-[80px] resize-y"
                      value={formData[f.key] || ''}
                      onChange={e => { setDirty(true); setFormData((prev: any) => ({ ...prev, [f.key]: e.target.value })) }}
                      rows={4}
                    />
                  ) : f.type === 'number' ? (
                    <input
                      type="number"
                      className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
                      value={formData[f.key] || ''}
                      onChange={e => { setDirty(true); setFormData((prev: any) => ({ ...prev, [f.key]: e.target.valueAsNumber || 0 })) }}
                    />
                  ) : (
                    <input
                      type="text"
                      className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
                      value={formData[f.key] || ''}
                      onChange={e => { setDirty(true); setFormData((prev: any) => ({ ...prev, [f.key]: e.target.value })) }}
                    />
                  )}
                  <DataProvenance provenance={provenance[f.key]} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div />
        <div className="flex items-center gap-2">
          {section === 'summary' && (
            <Button variant="ghost" onClick={handleGenerate} loading={genLoading}>
              <Sparkles size={14} /> Générer résumé IA
            </Button>
          )}
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {saved ? <><Check size={14} /> Sauvegardé</> : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function jsonText(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    try { return JSON.stringify(value, null, 2) } catch { return '' }
  }
  return String(value)
}

function getSectionFields(section: string) {
  const map: Record<string, { key: string; label: string; type: string; placeholder?: string }[]> = {
    management: [
      { key: 'problemes_gestion', label: 'Problèmes de gestion', type: 'textarea' },
      { key: 'ressources_humaines', label: 'Ressources humaines', type: 'textarea' },
      { key: 'actifs_physiques', label: 'Actifs physiques', type: 'textarea' },
      { key: 'ressources_intellectuelles', label: 'Ressources intellectuelles', type: 'textarea' },
      { key: 'production_fournisseurs', label: 'Production et fournisseurs', type: 'textarea' },
    ],
    marketing: [
      { key: 'clients_valeur', label: 'Clients et proposition de valeur', type: 'textarea' },
      { key: 'analyse_marche', label: 'Analyse du marché', type: 'textarea' },
      { key: 'concurrents', label: 'Concurrents', type: 'textarea' },
      { key: 'offre_prix', label: 'Offre et prix', type: 'textarea' },
      { key: 'branding_positionnement', label: 'Branding et positionnement', type: 'textarea' },
      { key: 'canaux_communication', label: 'Canaux de communication', type: 'textarea' },
      { key: 'relation_client', label: 'Relation client', type: 'textarea' },
    ],
    financial: [
      { key: 'point_depart', label: 'Point de départ', type: 'textarea' },
      { key: 'couts_configuration', label: 'Coûts de configuration', type: 'number' },
      { key: 'capital', label: 'Capital', type: 'number' },
      { key: 'seuil_rentabilite', label: 'Seuil de rentabilité', type: 'number' },
      { key: 'autres_mesures', label: 'Autres mesures financières', type: 'textarea' },
    ],
    legal: [
      { key: 'statut_juridique', label: 'Statut juridique', type: 'text' },
      { key: 'immatriculation', label: "Numéro d'immatriculation", type: 'text' },
      { key: 'contrats', label: 'Types de contrats', type: 'textarea' },
      { key: 'assurances', label: 'Assurances', type: 'textarea' },
    ],
    kpis: [
      { key: 'kpis', label: 'Indicateurs de performance (KPIs)', type: 'json', placeholder: '{\n  "KPI 1": "Valeur cible"\n}' },
      { key: 'objectifs_mesure', label: 'Objectifs de mesure', type: 'textarea' },
      { key: 'revues_performance', label: 'Revues de performance', type: 'textarea' },
    ],
    summary: [
      { key: 'resume_executif', label: 'Résumé analytique', type: 'textarea' },
    ],
  }
  return map[section] || []
}
