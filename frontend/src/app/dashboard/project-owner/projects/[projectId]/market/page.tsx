'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check, Target } from 'lucide-react'
import { marketService } from '@/services/market.service'
import { Button, Card, CardHeader, ErrorAlert, SuccessAlert, TabNav } from '@/components/shared/ui'
import { applyPrefill, type ProvenanceInfo } from '@/hooks/useProjectPrefill'
import { DataProvenance } from '@/components/shared/DataProvenance'
import { MissingInfoCard } from '@/components/shared/MissingInfoCard'
import type { ChecklistItem } from '@/types/project-context'
import { projectContextService } from '@/services/project-context.service'

const SECTIONS = [
  { id: 'essence',      label: 'Brand Essence' },
  { id: 'alignement',   label: 'Alignement' },
  { id: 'position',     label: 'Positionnement' },
  { id: 'identite',     label: 'Identité visuelle' },
  { id: 'narration',    label: 'Narration' },
  { id: 'messages',     label: 'Messages clés' },
  { id: 'canaux',       label: 'Canaux marketing' },
  { id: 'partenariats', label: 'Partenariats' },
]

export default function MarketPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [section, setSection] = useState('essence')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [provenance, setProvenance] = useState<Record<string, ProvenanceInfo>>({})
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await marketService.get(projectId)
      try {
        const prefill = await projectContextService.getPrefill(projectId, 'market')
        const merged = applyPrefill(data || {}, prefill)
        setFormData(merged.data)
        setProvenance(merged.provenance)
        setChecklist(prefill.checklist || [])
      } catch {
        setFormData(data || {})
        setProvenance({})
        setChecklist([])
      }
    } catch { setError('Erreur de chargement') }
    finally { setLoading(false) }
  }, [projectId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await marketService.update(projectId, formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { setError('Erreur de sauvegarde') }
    finally { setSaving(false) }
  }

  const fieldMap: Record<string, { key: string; label: string }> = {
    essence:      { key: 'essence_marque',       label: 'Essence de la marque' },
    alignement:   { key: 'alignement_objectifs', label: 'Alignement des objectifs' },
    position:     { key: 'positionnement',       label: 'Positionnement' },
    identite:     { key: 'identite_visuelle',    label: 'Identité visuelle' },
    narration:    { key: 'narration',            label: 'Narration de la marque' },
    messages:     { key: 'messages_cles',        label: 'Messages clés' },
    canaux:       { key: 'canaux_marketing',     label: 'Canaux marketing' },
    partenariats: { key: 'partenariats_market',  label: 'Partenariats stratégiques' },
  }
  const currentField = fieldMap[section]

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 hover:bg-moss-light rounded-lg">
          <ArrowLeft size={18} className="text-ink3" />
        </button>
        <h1 className="font-syne text-lg font-extrabold text-ink">Accès au Marché</h1>
      </div>

      <TabNav tabs={SECTIONS} active={section} onChange={setSection} />

      {error && <ErrorAlert message={error} />}
      {saved && <SuccessAlert message="Sauvegardé ✓" />}

      <MissingInfoCard checklist={checklist} />

      <Card className="p-0 overflow-hidden">
        <CardHeader icon={<Target size={13} />} title={currentField?.label || ''} />
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-moss" /></div>
          ) : (
            <div className="space-y-4">
              <textarea
                className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss min-h-[120px] resize-y"
                value={currentField ? (formData[currentField.key] || '') : ''}
                onChange={e => setFormData((prev: any) => ({ ...prev, [currentField?.key || '']: e.target.value }))}
                rows={6}
                placeholder={`Décrivez ${(currentField?.label || '').toLowerCase()}...`}
              />
              {currentField && <DataProvenance provenance={provenance[currentField.key]} />}
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} loading={saving}>
          {saved ? <><Check size={14} /> Sauvegardé</> : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}
