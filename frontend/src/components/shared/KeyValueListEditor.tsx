'use client'

import { useState } from 'react'
import { Check, Plus, Trash2, X } from 'lucide-react'

interface KeyValueListEditorProps {
  value: unknown
  onChange: (value: Record<string, string | number>) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
  addLabel?: string
  emptyHint?: string
  /** Convertit les valeurs numériques en number (utile pour les KPIs d'impact). */
  allowNumbers?: boolean
}

function toRecord(value: unknown): Record<string, string | number> {
  if (value === undefined || value === null) return {}
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, string | number>
      }
    } catch {
      return {}
    }
    return {}
  }
  if (Array.isArray(value)) {
    const rec: Record<string, string | number> = {}
    value.forEach((item, i) => {
      if (item && typeof item === 'object') {
        const keys = Object.keys(item as Record<string, unknown>)
        rec[String((item as Record<string, unknown>)[keys[0]] ?? '')] = ''
      } else {
        rec[String(item)] = ''
      }
    })
    return rec
  }
  return value as Record<string, string | number>
}

function coerce(value: string, allowNumbers: boolean): string | number {
  if (!allowNumbers) return value
  if (value.trim() === '') return ''
  const n = Number(value)
  return Number.isFinite(n) ? n : value
}

export function KeyValueListEditor({
  value,
  onChange,
  keyPlaceholder = 'Libellé',
  valuePlaceholder = 'Valeur',
  addLabel = 'Ajouter',
  emptyHint = 'Aucun élément. Ajoutez-en un ci-dessous.',
  allowNumbers = false,
}: KeyValueListEditorProps) {
  const current = toRecord(value)
  const rows = Object.entries(current)
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')

  const emit = (next: Record<string, string | number>) =>
    onChange(
      Object.fromEntries(
        Object.entries(next).filter(([, v]) => v !== '' && v !== undefined),
      ) as Record<string, string | number>,
    )

  const updateKey = (oldKey: string, newKey: string) => {
    const next: Record<string, string | number> = {}
    for (const [k, v] of rows) next[k === oldKey ? newKey : k] = v
    emit(next)
  }

  const updateValue = (key: string, raw: string) => {
    const next: Record<string, string | number> = {}
    for (const [k, v] of rows) next[k] = k === key ? coerce(raw, allowNumbers) : v
    emit(next)
  }

  const remove = (key: string) => {
    const next = { ...toRecord(value) }
    delete next[key]
    emit(next)
  }

  const add = () => {
    const key = newKey.trim()
    if (!key) return
    emit({ ...toRecord(value), [key]: coerce(newVal, allowNumbers) })
    setCreating(false)
    setNewKey('')
    setNewVal('')
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 && !creating && (
        <p className="text-xs text-ink3 font-dm py-1">{emptyHint}</p>
      )}

      {rows.map(([key, val]) => (
        <div key={key} className="flex items-center gap-2">
          <input
            className="w-1/2 text-sm px-3 py-2 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
            value={key}
            placeholder={keyPlaceholder}
            onChange={(e) => updateKey(key, e.target.value)}
          />
          <input
            className="flex-1 text-sm px-3 py-2 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
            value={String(val ?? '')}
            placeholder={valuePlaceholder}
            onChange={(e) => updateValue(key, e.target.value)}
            inputMode={allowNumbers ? 'decimal' : undefined}
          />
          <button
            onClick={() => remove(key)}
            className="p-1.5 rounded-lg hover:bg-red/10 text-ink3 hover:text-red transition-colors"
            title="Supprimer"
            aria-label="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {creating ? (
        <div className="flex items-center gap-2">
          <input
            className="w-1/2 text-sm px-3 py-2 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
            value={newKey}
            placeholder={keyPlaceholder}
            onChange={(e) => setNewKey(e.target.value)}
            autoFocus
          />
          <input
            className="flex-1 text-sm px-3 py-2 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
            value={newVal}
            placeholder={valuePlaceholder}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add()
            }}
          />
          <button
            onClick={add}
            disabled={!newKey.trim()}
            className="p-1.5 rounded-lg hover:bg-moss/10 text-moss hover:text-moss-mid transition-colors disabled:opacity-40"
            title="Valider"
            aria-label="Valider"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => setCreating(false)}
            className="p-1.5 rounded-lg hover:bg-ink/[.04] text-ink3 hover:text-ink2 transition-colors"
            title="Annuler"
            aria-label="Annuler"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 text-[11px] font-semibold text-moss hover:text-moss-mid transition-colors"
        >
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
  )
}