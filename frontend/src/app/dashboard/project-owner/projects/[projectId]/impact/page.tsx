'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check, LineChart, Sparkles } from 'lucide-react'
import { impactService } from '@/services/impact.service'
import { Button, Card, CardHeader, Progress, ErrorAlert, SuccessAlert, TabNav } from '@/components/shared/ui'
import { AiSummaryBadge } from '@/components/shared/AiSummaryBadge'
import { applyPrefill, type ProvenanceInfo } from '@/hooks/useProjectPrefill'
import { DataProvenance } from '@/components/shared/DataProvenance'
import { MissingInfoCard } from '@/components/shared/MissingInfoCard'
import type { ChecklistItem } from '@/types/project-context'
import { projectContextService } from '@/services/project-context.service'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { ContextualCoachPanel } from '@/components/coach'

const SECTIONS = [
  { id: 'env',        label: 'KPIs Environnementaux' },
  { id: 'social',     label: 'KPIs Sociaux' },
  { id: 'econ',       label: 'KPIs Économiques' },
  { id: 'method',     label: 'Méthode & Période' },
  { id: 'objectifs',  label: 'Objectifs vs Réel' },
  { id: 'report',     label: 'Rapport' },
]

export default function ImpactPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [section, setSection] = useState('env')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [progress, setProgress] = useState<any>(null)
  const [provenance, setProvenance] = useState<Record<string, ProvenanceInfo>>({})
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [dirty, setDirty] = useState(false)
  const { guardLeave, modal } = useUnsavedChanges(dirty)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await impactService.get(projectId)
      try {
        const prefill = await projectContextService.getPrefill(projectId, 'impact')
        const merged = applyPrefill(data || {}, prefill)
        setFormData(merged.data)
        setProvenance(merged.provenance)
        setChecklist(prefill.checklist || [])
      } catch {
        setFormData(data || {})
        setProvenance({})
        setChecklist([])
      }
      const p = await impactService.getProgress(projectId)
      setProgress(p)
    } catch { setError('Erreur de chargement') }
    finally { setLoading(false) }
  }, [projectId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await impactService.update(projectId, formData)
      setSaved(true)
      setDirty(false)
      setTimeout(() => setSaved(false), 2000)
      const p = await impactService.getProgress(projectId)
      setProgress(p)
    } catch { setError('Erreur de sauvegarde') }
    finally { setSaving(false) }
  }

  const handleGenerateReport = async () => {
    setGenLoading(true)
    try {
      const result = await impactService.generateReport(projectId)
      setDirty(true)
      setFormData((prev: any) => ({ ...prev, rapport_impact: result.rapport_impact }))
    } catch { setError('Erreur de génération') }
    finally { setGenLoading(false) }
  }

  const sectionFields: Record<string, { key: string; label: string }[]> = {
    env:       [{ key: 'kpis_environnementaux', label: 'KPIs Environnementaux (CO₂, eau, déchets, énergie)' }],
    social:    [{ key: 'kpis_sociaux', label: 'KPIs Sociaux (emplois, inclusion, diversité)' }],
    econ:      [{ key: 'kpis_economiques', label: 'KPIs Économiques (CA, marge, croissance)' }],
    method:    [
      { key: 'methode_mesure', label: 'Méthodologie (B Impact, GRI, SDGs...)' },
      { key: 'periode_mesure', label: 'Période de mesure (MONTHLY/QUARTERLY/YEARLY)' },
    ],
    objectifs: [
      { key: 'objectifs_impact', label: 'Objectifs chiffrés (JSON)' },
      { key: 'resultats_actuels', label: 'Résultats actuels (JSON)' },
    ],
    report:    [{ key: 'rapport_impact', label: 'Rapport d\'impact' }],
  }

  const fields = sectionFields[section] || []

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => guardLeave(() => router.back())} className="p-1 hover:bg-moss-light rounded-lg">
          <ArrowLeft size={18} className="text-ink3" />
        </button>
        <div>
          <h1 className="font-syne text-lg font-extrabold text-ink">Mesure de l&apos;Impact</h1>
          <p className="text-xs text-ink3">KPIs environnementaux, sociaux et économiques</p>
        </div>
        {progress && (
          <div className="ml-auto flex items-center gap-2">
            <Progress value={progress.percentage} />
            <span className="text-xs font-bold text-moss">{progress.percentage}%</span>
          </div>
        )}
      </div>

      <TabNav tabs={SECTIONS} active={section} onChange={(id) => guardLeave(() => setSection(id))} />

      {error && <ErrorAlert message={error} />}
      {saved && <SuccessAlert message="Sauvegardé ✓" />}

      <MissingInfoCard checklist={checklist} />

      <Card className="p-0 overflow-hidden">
        <CardHeader icon={<LineChart size={13} />} title={SECTIONS.find(s => s.id === section)?.label || ''}>
          {section === 'report' && <AiSummaryBadge generated={!!formData.rapport_impact} />}
        </CardHeader>
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-moss" /></div>
          ) : (
            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-ink2 mb-1">{f.label}</label>
                  {f.key === 'methode_mesure' || f.key === 'periode_mesure' ? (
                    <input
                      type="text"
                      className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
                      value={(formData as any)[f.key] || ''}
                      onChange={e => { setDirty(true); setFormData((prev: any) => ({ ...prev, [f.key]: e.target.value })) }}
                    />
                  ) : (
                    <textarea
                      className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss min-h-[120px] resize-y font-mono"
                      value={
                        typeof (formData as any)[f.key] === 'object'
                          ? JSON.stringify((formData as any)[f.key], null, 2)
                          : ((formData as any)[f.key] || '')
                      }
                      onChange={e => {
                        const val = e.target.value
                        setDirty(true)
                        setFormData((prev: any) => ({ ...prev, [f.key]: val }))
                      }}
                      rows={6}
                    />
                  )}
                  <DataProvenance provenance={provenance[f.key]} />
                </div>
              ))}

              {/* Ecart display */}
              {section === 'objectifs' && formData.ecart_objectif && Object.keys(formData.ecart_objectif).length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-moss-light/20 border border-moss/20">
                  <h4 className="text-xs font-bold text-ink2 mb-2">Écart objectif / réel</h4>
                  <div className="space-y-1">
                    {Object.entries(formData.ecart_objectif)
                      .filter(([k]) => !k.endsWith('_percentage'))
                      .map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-ink2">{key}</span>
                          <span className={`font-bold ${Number(val) >= 0 ? 'text-moss' : 'text-red'}`}>
                            {Number(val) >= 0 ? '+' : ''}{String(val)}
                            {formData.ecart_objectif[`${key}_percentage`] !== undefined && (
                              <span className="text-xs text-ink3 ml-1">
                                ({formData.ecart_objectif[`${key}_percentage`]}%)
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div />
        <div className="flex items-center gap-2">
          {section === 'report' && (
            <Button variant="ghost" onClick={handleGenerateReport} loading={genLoading}>
              <Sparkles size={14} /> Générer rapport IA
            </Button>
          )}
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {saved ? <><Check size={14} /> Sauvegardé</> : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <ContextualCoachPanel
        projectId={projectId}
        module="IMPACT"
        section={SECTIONS.find(s => s.id === section)?.label}
        formData={formData}
      />

      {modal}
    </div>
  )
}
