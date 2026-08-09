'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { gbmService } from '@/services/gbm.service'
import { Button, Field, Input, Select, Textarea } from '@/components/shared/ui'
import type { GbmFieldConfig } from '@/data/gbm/steps'

interface OneToManyManagerProps {
  projectId: string
  stepId: string
  fields: GbmFieldConfig[]
  onChanged?: () => void
}

export interface OneToManyManagerHandle {
  savePending: () => Promise<boolean>
}

type GbmItem = Record<string, unknown>

function isEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim() === ''
}

function getApiMessage(err: unknown, fallback: string): string {
  const res = (err as { response?: { data?: { message?: string | string[] } } })?.response
  const msg = res?.data?.message
  if (Array.isArray(msg)) return msg.join(', ')
  if (typeof msg === 'string') return msg
  return fallback
}

function strValue(item: GbmItem, key: string): string {
  const value = item[key]
  return typeof value === 'string' ? value : ''
}

export const OneToManyManager = forwardRef<OneToManyManagerHandle, OneToManyManagerProps>(
  function OneToManyManager({ projectId, stepId, fields, onChanged }, ref) {
    const [items, setItems] = useState<GbmItem[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newItem, setNewItem] = useState<Record<string, unknown>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const loadItems = useCallback(async () => {
      setLoading(true)
      try {
        const data = await gbmService.listStepItems(projectId, stepId)
        setItems(Array.isArray(data) ? (data as GbmItem[]) : [])
      } catch (e) {
        setError(getApiMessage(e, 'Erreur lors du chargement'))
      } finally {
        setLoading(false)
      }
    }, [projectId, stepId])

    useEffect(() => { loadItems() }, [loadItems])

    const persistPending = useCallback(async (): Promise<boolean> => {
      if (!showForm) return true

      const payload: Record<string, unknown> = {}
      for (const field of fields) {
        const value = newItem[field.key]
        if (value === undefined || value === null || value === '' || isEmptyString(value)) continue
        payload[field.key] = value
      }

      if (Object.keys(payload).length === 0) {
        setError('Renseignez au moins un champ avant d’enregistrer.')
        return false
      }

      setSaving(true)
      setError('')
      try {
        if (editingId) {
          await gbmService.updateStepItem(projectId, stepId, editingId, payload)
        } else {
          await gbmService.addStepItem(projectId, stepId, payload)
        }
        setNewItem({})
        setEditingId(null)
        setShowForm(false)
        await loadItems()
        onChanged?.()
        return true
      } catch (e) {
        setError(getApiMessage(e, 'Erreur lors de l’enregistrement'))
        return false
      } finally {
        setSaving(false)
      }
    }, [showForm, newItem, editingId, fields, projectId, stepId, loadItems, onChanged])

    useImperativeHandle(ref, () => ({ savePending: persistPending }), [persistPending])

    const handleSubmit = async () => {
      const ok = await persistPending()
      if (ok) setShowForm(false)
    }

    const handleDelete = async (itemId: string) => {
      setError('')
      try {
        await gbmService.deleteStepItem(projectId, stepId, itemId)
        await loadItems()
        onChanged?.()
      } catch (e) {
        setError(getApiMessage(e, 'Erreur lors de la suppression'))
      }
    }

    const openEdit = (item: GbmItem) => {
      const { id, ...rest } = item
      setEditingId(String(id))
      setNewItem(rest)
      setShowForm(true)
      setError('')
    }

    const closeForm = () => {
      setShowForm(false)
      setEditingId(null)
      setNewItem({})
      setError('')
    }

    const primaryFields = fields.filter(f => f.type !== 'checkbox')

    if (loading) {
      return (
        <div className="flex items-center justify-center py-10 text-ink3">
          <Loader2 size={18} className="animate-spin text-moss mr-2" /> Chargement…
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {error && (
          <div className="text-[12px] text-red bg-red-light border border-red/18 rounded-lg px-3 py-2">{error}</div>
        )}

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item: GbmItem) => (
              <div
                key={String(item.id)}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface-2"
              >
                <div className="flex-1 min-w-0">
                  {primaryFields.slice(0, 2).map(f => (
                    <div key={f.key} className="text-[13px]">
                      <span className="font-medium text-ink">
                        {f.type === 'checkbox'
                          ? (item[f.key] ? 'Oui' : '—')
                          : strValue(item, f.key) || '—'}
                      </span>
                    </div>
                  ))}
                  {primaryFields.length > 2 && (
                    <div className="text-[11px] text-ink3 mt-1">
                      {primaryFields.slice(2).map(f => strValue(item, f.key)).filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-ink2 text-[11px] hover:underline flex items-center gap-1"
                    aria-label="Modifier"
                  >
                    <Pencil size={12} /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(String(item.id))}
                    className="text-red text-[11px] hover:underline flex items-center gap-1"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={12} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && !showForm && (
          <div className="text-center py-8 text-[13px] text-ink3">
            Aucun élément. Ajoutez-en un pour avancer.
          </div>
        )}

        {showForm ? (
          <div className="space-y-3 p-4 rounded-lg border border-dashed border-moss/30 bg-moss-light/10">
            <div className="text-xs font-semibold text-ink2">
              {editingId ? 'Modifier l’élément' : 'Nouvel élément'}
            </div>
            {fields.map(field => (
              <Field key={field.key} label={field.label}>
                {field.type === 'textarea' ? (
                  <Textarea
                    value={strValue(newItem, field.key)}
                    onChange={e => setNewItem(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={strValue(newItem, field.key)}
                    onChange={e => setNewItem(prev => ({ ...prev, [field.key]: e.target.value }))}
                  >
                    <option value="">— Sélectionner —</option>
                    {(field.options || []).map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                ) : field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(newItem[field.key])}
                      onChange={e => setNewItem(prev => ({ ...prev, [field.key]: e.target.checked }))}
                      className="w-4 h-4 accent-moss"
                    />
                    <span className="text-[12px] text-ink2">{field.placeholder || 'Oui'}</span>
                  </label>
                ) : (
                  <Input
                    value={strValue(newItem, field.key)}
                    onChange={e => setNewItem(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                  />
                )}
              </Field>
            ))}
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={handleSubmit} loading={saving}>
                {editingId ? <><Check size={13} /> Enregistrer</> : <><Plus size={13} /> Ajouter</>}
              </Button>
              <Button size="sm" variant="ghost" onClick={closeForm}>
                <X size={13} /> Annuler
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => { setShowForm(true); setError('') }}>
            <Plus size={13} /> Ajouter un élément
          </Button>
        )}
      </div>
    )
  },
)
