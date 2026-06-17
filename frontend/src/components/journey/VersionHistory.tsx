'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ProjectVersion } from '@/types/project'
import { Modal, Button, Badge, Card, EmptyState } from '@/components/shared/ui'
import {
  GitBranch, Tag, User, Calendar, RotateCcw, Plus, CheckCircle2,
  ArrowLeftRight, X, Clock,
} from 'lucide-react'

interface VersionHistoryProps {
  projectId: string
  versions: ProjectVersion[]
  currentVersionId?: string
  onCreateVersion: (label?: string) => Promise<void>
  onRestoreVersion: (versionId: string) => Promise<void>
  onCompareVersions: (v1: string, v2: string) => void
  loading?: boolean
}

export function VersionHistory({
  projectId, versions, currentVersionId,
  onCreateVersion, onRestoreVersion, onCompareVersions, loading,
}: VersionHistoryProps) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [versionLabel, setVersionLabel] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null)
  const [compareA, setCompareA] = useState('')
  const [compareB, setCompareB] = useState('')
  const [showCompare, setShowCompare] = useState(false)

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const handleCreate = async () => {
    setCreating(true)
    try {
      await onCreateVersion(versionLabel || undefined)
      setVersionLabel('')
      setShowCreate(false)
    } finally {
      setCreating(false)
    }
  }

  const handleRestore = async () => {
    if (!restoreTarget) return
    try {
      await onRestoreVersion(restoreTarget)
      setRestoreTarget(null)
    } finally {
      setRestoreTarget(null)
    }
  }

  const getAuthorName = (v: ProjectVersion): string => {
    if (v.author?.profile) {
      return `${v.author.profile.first_name} ${v.author.profile.last_name}`
    }
    return v.created_by || 'Utilisateur inconnu'
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <GitBranch size={12} /> Versions ({versions.length})
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Historique des versions" className="max-w-2xl">
        <div className="space-y-4">
          {/* Create version */}
          {showCreate ? (
            <Card className="p-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em] block mb-1">
                  Libellé de la version (optionnel)
                </label>
                <input
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="Ex: Version après révision expert"
                  className="w-full text-[12px] px-3 py-2 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss font-dm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setVersionLabel('') }}>
                  Annuler
                </Button>
                <Button variant="primary" size="sm" onClick={handleCreate} loading={creating}>
                  <Plus size={12} /> Créer
                </Button>
              </div>
            </Card>
          ) : (
            <Button variant="primary" size="sm" fullWidth onClick={() => setShowCreate(true)}>
              <Plus size={12} /> Créer une nouvelle version
            </Button>
          )}

          {/* Compare mode */}
          {showCompare && (
            <div className="flex items-center gap-2 p-3 bg-surface-2 rounded-lg border border-border">
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="flex-1 text-[11px] px-2 py-1.5 border border-border rounded-lg bg-surface text-ink outline-none font-dm"
              >
                <option value="">Sélectionner v1</option>
                {sortedVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.version_number} - {v.label || getAuthorName(v)}
                  </option>
                ))}
              </select>
              <span className="text-ink3 text-[11px]">vs</span>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="flex-1 text-[11px] px-2 py-1.5 border border-border rounded-lg bg-surface text-ink outline-none font-dm"
              >
                <option value="">Sélectionner v2</option>
                {sortedVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.version_number} - {v.label || getAuthorName(v)}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                size="sm"
                disabled={!compareA || !compareB || compareA === compareB}
                onClick={() => { onCompareVersions(compareA, compareB); setShowCompare(false) }}
              >
                Comparer
              </Button>
              <button
                onClick={() => setShowCompare(false)}
                className="text-ink3 hover:text-ink transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {!showCompare && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowCompare(true)}>
                <ArrowLeftRight size={12} /> Comparer des versions
              </Button>
            </div>
          )}

          {/* Version list */}
          {sortedVersions.length === 0 ? (
            <EmptyState
              icon={<GitBranch size={24} />}
              title="Aucune version"
              description="Créez votre première version pour sauvegarder un instantané du projet."
            />
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {sortedVersions.map((v) => (
                <div
                  key={v.id}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg border text-[11px] transition-colors',
                    v.id === currentVersionId
                      ? 'bg-moss-light/30 border-moss/25'
                      : 'bg-surface border-border hover:border-moss/15',
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                      v.id === currentVersionId ? 'bg-moss text-white' : 'bg-border text-ink3',
                    )}>
                      <Tag size={12} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-ink">{v.version_number}</span>
                        {v.label && (
                          <span className="text-ink2 truncate max-w-[160px]">- {v.label}</span>
                        )}
                        {v.id === currentVersionId && (
                          <Badge variant="green">
                            <CheckCircle2 size={8} /> Actuelle
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-ink3">
                        <span className="flex items-center gap-1">
                          <User size={9} /> {getAuthorName(v)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={9} /> {new Date(v.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        {v.changelog && v.changelog.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock size={9} /> {v.changelog.length} modification{v.changelog.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                    {v.id !== currentVersionId && (
                      <button
                        onClick={() => setRestoreTarget(v.id)}
                        className="p-1.5 rounded-md text-ink3 hover:text-amber hover:bg-amber-light transition-colors"
                        title="Restaurer cette version"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Changelog for current version */}
          {versions.find(v => v.id === currentVersionId)?.changelog && (
            <details className="group">
              <summary className="text-[11px] font-semibold text-ink3 cursor-pointer hover:text-ink transition-colors list-none flex items-center gap-1.5">
                <span className="text-[9px]">▶</span>
                Modifications de la version actuelle
              </summary>
              <div className="mt-2 space-y-1">
                {(versions.find(v => v.id === currentVersionId)?.changelog || []).map((change, i) => (
                  <div key={i} className="text-[10px] px-2 py-1 rounded bg-ink/[.04] text-ink2">
                    <span className="font-semibold">{change.field}</span> :{' '}
                    <span className="text-ink3 line-through">{String(change.old)}</span>
                    {' → '}
                    <span className="text-moss">{String(change.new)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </Modal>

      {/* Restore confirmation modal */}
      <Modal
        open={restoreTarget !== null}
        onClose={() => setRestoreTarget(null)}
        title="Restaurer une version"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-ink2">
            Êtes-vous sûr de vouloir restaurer cette version ? Les modifications non sauvegardées seront perdues.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setRestoreTarget(null)}>
              Annuler
            </Button>
            <Button variant="amber" size="sm" onClick={handleRestore}>
              <RotateCcw size={12} /> Restaurer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
