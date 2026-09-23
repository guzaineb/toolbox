'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Eye, Plus, Target, X } from 'lucide-react'
import { Badge, Button, Card, CardHeader, Field, Input, Textarea } from '@/components/shared/ui'
import type { SessionBlocker } from '@/types/coaching'
import type { SessionDraft, SetSessionField } from './session-types'

function newBlockerId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `blk-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Onglet DÉROULEMENT : objectif, points abordés, notes, constats du coach et
 * blocages identifiés.
 */
export function RunningTab({
  draft, setField, canManage, isClosed,
}: {
  draft: SessionDraft
  setField: SetSessionField
  canManage: boolean
  isClosed: boolean
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="space-y-5">
        <Card>
          <CardHeader icon={<Target size={13} />} title="Ce qui se passe pendant la séance" />
          <div className="p-[18px] space-y-3">
            <Field label="Objectif de la session">
              <Input
                value={draft.objective}
                onChange={(e) => setField('objective', e.target.value)}
                disabled={!canManage || isClosed}
                placeholder="Ex. Valider le Business Model"
              />
              {isClosed && <p className="text-[10px] text-ink3 mt-1">Session clôturée : l&apos;objectif est figé.</p>}
            </Field>
            <Field label="Points abordés (un par ligne)">
              <Textarea
                value={draft.topicsDiscussed}
                onChange={(e) => setField('topicsDiscussed', e.target.value)}
                rows={4}
                disabled={!canManage}
                placeholder={'Ex.\nSegmentation client\nProposition de valeur\nCanaux de distribution'}
              />
              <p className="text-[10px] text-ink3 mt-1">Sujets réellement traités — à distinguer de l&apos;agenda prévu.</p>
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader icon={<ClipboardList size={13} />} title="Notes prises pendant la séance" />
          <div className="p-[18px]">
            <Textarea
              value={draft.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={7}
              disabled={!canManage}
              placeholder="Ce qui a été dit, remontées du porteur… Les notes restent internes et n'engagent rien."
            />
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader icon={<Eye size={13} />} title="Constats du coach">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber bg-amber/10 px-2 py-0.5 rounded">
              ≠ Notes
            </span>
          </CardHeader>
          <div className="p-[18px] space-y-2">
            <p className="text-[11px] text-ink3">
              Votre lecture professionnelle : ce que vous observez, ce qui est validé ou non par les faits.
              Exemple — note : « vente via Instagram » ; constat : « canal non encore validé par des données terrain ».
            </p>
            <Textarea
              value={draft.findings}
              onChange={(e) => setField('findings', e.target.value)}
              rows={6}
              disabled={!canManage}
              placeholder="Un constat par ligne"
            />
          </div>
        </Card>

        <BlockersCard
          blockers={draft.blockers}
          onChange={(blockers) => setField('blockers', blockers)}
          disabled={!canManage}
        />
      </div>
    </div>
  )
}

function BlockersCard({
  blockers, onChange, disabled,
}: {
  blockers: SessionBlocker[]
  onChange: (blockers: SessionBlocker[]) => void
  disabled: boolean
}) {
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [showForm, setShowForm] = useState(false)

  const add = () => {
    if (!title.trim()) return
    onChange([...blockers, { id: newBlockerId(), title: title.trim(), detail: detail.trim() || undefined, resolved: false }])
    setTitle('')
    setDetail('')
    setShowForm(false)
  }

  const toggleResolved = (id: string) =>
    onChange(blockers.map((b) => b.id === id ? { ...b, resolved: !b.resolved, resolvedAt: !b.resolved ? new Date().toISOString() : undefined } : b))

  const remove = (id: string) => onChange(blockers.filter((b) => b.id !== id))

  const unresolved = blockers.filter((b) => !b.resolved).length

  return (
    <Card>
      <CardHeader icon={<AlertTriangle size={13} />} title={`Blocages identifiés (${unresolved} ouvert${unresolved > 1 ? 's' : ''})`}>
        {!disabled && (
          <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} Blocage
          </Button>
        )}
      </CardHeader>
      <div className="p-[18px] space-y-2">
        <p className="text-[11px] text-ink3">
          Obstacles identifiés pendant la séance. Ils seront repris automatiquement dans
          « Depuis la dernière session » jusqu&apos;à résolution.
        </p>
        {showForm && (
          <div className="border border-border rounded-[10px] p-3 space-y-2 bg-surface-2/50">
            <Field label="Blocage" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Manque de données marché" />
            </Field>
            <Field label="Détail (optionnel)">
              <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={2} />
            </Field>
            <div className="flex justify-end">
              <Button size="sm" variant="primary" onClick={add} disabled={!title.trim()}>
                Ajouter
              </Button>
            </div>
          </div>
        )}
        {blockers.length === 0 && !showForm && (
          <p className="text-[12px] text-ink3">Aucun blocage identifié pour cette session.</p>
        )}
        {blockers.map((b) => (
          <div key={b.id} className={`border rounded-[10px] p-2.5 flex items-start gap-2 ${b.resolved ? 'border-moss/30 bg-moss/[.04]' : 'border-border'}`}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => toggleResolved(b.id)}
              className={`mt-[2px] w-[14px] h-[14px] rounded border shrink-0 cursor-pointer transition-colors ${
                b.resolved ? 'bg-moss border-moss' : 'bg-surface border-border hover:border-moss'
              }`}
              title={b.resolved ? 'Marquer comme non résolu' : 'Marquer comme résolu'}
              aria-label={b.resolved ? 'Marquer comme non résolu' : 'Marquer comme résolu'}
            >
              {b.resolved && <CheckCircle2 size={12} className="text-white -ml-[1px] -mt-[1px]" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-[12px] font-semibold ${b.resolved ? 'text-ink3 line-through' : 'text-ink'}`}>
                {b.title}
              </div>
              {b.detail && <div className="text-[11px] text-ink3">{b.detail}</div>}
            </div>
            <Badge variant={b.resolved ? 'green' : 'red'}>
              {b.resolved ? 'Résolu' : 'Ouvert'}
            </Badge>
            {!disabled && (
              <button onClick={() => remove(b.id)} className="text-ink3 hover:text-red-600 transition-colors cursor-pointer" aria-label="Supprimer le blocage">
                <X size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}