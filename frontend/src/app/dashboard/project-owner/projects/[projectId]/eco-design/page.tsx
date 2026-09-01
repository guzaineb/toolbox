'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check, Leaf } from 'lucide-react'
import { ecoDesignService } from '@/services/eco-design.service'
import { Button, Card, CardHeader, Progress, ErrorAlert, SuccessAlert } from '@/components/shared/ui'
import { applyPrefill, type ProvenanceInfo } from '@/hooks/useProjectPrefill'
import { DataProvenance } from '@/components/shared/DataProvenance'
import { MissingInfoCard } from '@/components/shared/MissingInfoCard'
import type { ChecklistItem } from '@/types/project-context'
import { projectContextService } from '@/services/project-context.service'

const PHASES = [
  { id: 'preparer',    label: 'Préparer la valise', fields: ['equipe_eco','projet_eco','contexte_eco','vision_durable'] },
  { id: 'cycle',       label: 'Configurer le cycle de vie', fields: ['cycle_de_vie'] },
  { id: 'evaluation',  label: 'Évaluer la performance', fields: ['performance_eco'] },
  { id: 'strategies',  label: 'Choix & évaluation stratégie', fields: ['strategies_eco'] },
  { id: 'plan',        label: "Plan d'action", fields: ['plan_action_eco'] },
]

export default function EcoDesignPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [phase, setPhase] = useState('preparer')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<any>(null)
  const [provenance, setProvenance] = useState<Record<string, ProvenanceInfo>>({})
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ecoDesignService.get(projectId)
      try {
        const prefill = await projectContextService.getPrefill(projectId, 'eco-design')
        const merged = applyPrefill(data || {}, prefill)
        setFormData(merged.data)
        setProvenance(merged.provenance)
        setChecklist(prefill.checklist || [])
      } catch {
        setFormData(data || {})
        setProvenance({})
        setChecklist([])
      }
      const p = await ecoDesignService.getProgress(projectId)
      setProgress(p)
    } catch { setError('Erreur de chargement') }
    finally { setLoading(false) }
  }, [projectId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await ecoDesignService.update(projectId, formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      const p = await ecoDesignService.getProgress(projectId)
      setProgress(p)
    } catch { setError('Erreur de sauvegarde') }
    finally { setSaving(false) }
  }

  const phaseFields = PHASES.find(p => p.id === phase)?.fields || []

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 hover:bg-moss-light rounded-lg">
          <ArrowLeft size={18} className="text-ink3" />
        </button>
        <div>
          <h1 className="font-syne text-lg font-extrabold text-ink">Éco-conception</h1>
          <p className="text-xs text-ink3">5 phases de transition vers l&apos;éco-conception</p>
        </div>
        {progress && (
          <div className="ml-auto flex items-center gap-2">
            <Progress value={progress.percentage} />
            <span className="text-xs font-bold text-moss">{progress.percentage}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {PHASES.map(p => (
          <button
            key={p.id}
            onClick={() => setPhase(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              phase === p.id ? 'border-moss bg-moss-light text-moss' : 'border-border text-ink3 hover:border-moss/30'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <CardHeader icon={<Leaf size={13} />} title={PHASES.find(p => p.id === phase)?.label || ''}>
          {saved && <SuccessAlert message="✓" />}
        </CardHeader>
        <div className="p-5">
          {error && <ErrorAlert message={error} className="mb-4" />}
          <MissingInfoCard checklist={checklist} />
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-moss" /></div>
          ) : (
            <div className="space-y-4">
              {phaseFields.map(f => (
                <div key={f}>
                  <label className="block text-xs font-semibold text-ink2 mb-1 capitalize">{f.replace(/_/g, ' ')}</label>
                  <textarea
                    className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss min-h-[80px] resize-y"
                    value={typeof formData[f] === 'object' ? JSON.stringify(formData[f], null, 2) : (formData[f] || '')}
                    onChange={e => setFormData((prev: any) => ({ ...prev, [f]: e.target.value }))}
                    rows={4}
                  />
                  <DataProvenance provenance={provenance[f]} />
                </div>
              ))}
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
