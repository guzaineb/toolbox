'use client'

import { useState } from 'react'
import { ListTodo, Plus, X } from 'lucide-react'
import { Button, Card, CardHeader, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui'
import type { CoachingAction } from '@/types/coaching'
import { apiError } from '@/lib/utils'
import { useCreateAction } from '@/hooks/useCoaching'
import type { GeneratedDocument } from '@/services/documents.service'
import { ActionRow } from '@/components/coaching/ActionRow'

/**
 * Onglet ACTIONS : actions issues de la session, création et revue des preuves
 * soumises par le porteur.
 */
export function ActionsTab({
  projectId, sessionId, actions, canManage, showForm, onToggleForm,
  responsableOptions, documents,
}: {
  projectId: string
  sessionId: string
  actions: CoachingAction[]
  canManage: boolean
  showForm: boolean
  onToggleForm: () => void
  responsableOptions: Array<{ id: string; label: string }>
  documents: GeneratedDocument[]
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [deadline, setDeadline] = useState('')
  const [responsibleUserId, setResponsibleUserId] = useState('')
  const [relatedDocumentKey, setRelatedDocumentKey] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createAction = useCreateAction(projectId)

  const createActionSubmit = async () => {
    if (!title.trim()) { setError("Le titre de l'action est requis"); return }
    setError(null)
    setCreating(true)
    try {
      await createAction.mutateAsync({
        title: title.trim(),
        description: description || undefined,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        sessionId,
        responsibleUserId: responsibleUserId || undefined,
        relatedDocumentKey: relatedDocumentKey || undefined,
      })
      setTitle(''); setDescription(''); setDeadline(''); setResponsibleUserId(''); setRelatedDocumentKey('')
      onToggleForm()
    } catch (err) {
      setError(apiError(err, "Erreur lors de la création de l'action"))
    } finally {
      setCreating(false)
    }
  }

  const openCount = actions.filter((a) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(a.status)).length

  return (
    <Card>
      <CardHeader
        icon={<ListTodo size={13} />}
        title={`Actions issues de la session (${actions.length})`}
      >
        <div className="flex items-center gap-2">
          {openCount > 0 && (
            <span className="text-[11px] text-ink3">{openCount} en cours</span>
          )}
          {canManage && (
            <Button variant="primary" size="sm" onClick={onToggleForm}>
              {showForm ? <X size={12} /> : <Plus size={12} />} Nouvelle action
            </Button>
          )}
        </div>
      </CardHeader>
      <div className="p-[18px] space-y-3">
        <p className="text-[11px] text-ink3">
          Chaque action répond à : QUI ? QUOI ? POUR QUAND ? POUR QUEL LIVRABLE ? AVEC QUEL STATUT ?
        </p>
        {showForm && (
          <div className="border border-border rounded-[10px] p-4 space-y-3 bg-surface-2/50">
            {error && <ErrorAlert message={error} />}
            <Field label="Titre" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Réaliser 10 interviews clients" />
            </Field>
            <Field label="Description">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </Field>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Responsable">
                <Select value={responsibleUserId} onChange={(e) => setResponsibleUserId(e.target.value)}>
                  <option value="">— À définir —</option>
                  {responsableOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Livrable concerné">
                <Select value={relatedDocumentKey} onChange={(e) => setRelatedDocumentKey(e.target.value)}>
                  <option value="">— Aucun —</option>
                  {[...documents].sort((a, b) => a.title.localeCompare(b.title)).map((d) => (
                    <option key={d.key} value={d.key}>{d.title}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Priorité">
                <Select value={priority} onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}>
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Échéance">
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={createActionSubmit} loading={creating}>
                Créer l&apos;action
              </Button>
            </div>
          </div>
        )}

        {actions.length === 0 && !showForm && (
          <p className="text-[12px] text-ink3">
            Aucune action rattachée à cette session. Créez les actions convenues avec le porteur.
          </p>
        )}

        {actions.map((a) => (
          <ActionRow key={a.id} mode="coach" action={a} canManage={canManage} documentTitle={
            a.related_document_key ? documents.find((d) => d.key === a.related_document_key)?.title : undefined
          } />
        ))}
      </div>
    </Card>
  )
}