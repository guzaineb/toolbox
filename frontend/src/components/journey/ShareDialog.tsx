'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ProjectShare } from '@/types/project'
import { Modal, Button, Badge, Card, EmptyState, Input, Toggle } from '@/components/shared/ui'
import {
  Share2, Link2, Copy, X, Calendar, Trash2, CheckCircle2, Globe,
} from 'lucide-react'

interface ShareDialogProps {
  projectId: string
  projectName: string
  shares: ProjectShare[]
  onCreateShare: (permissions: SharePermissions, expiresAt?: string) => Promise<void>
  onRevokeShare: (shareId: string) => Promise<void>
  loading?: boolean
}

export interface SharePermissions {
  can_view_bmc: boolean
  can_view_business_plan: boolean
  can_view_documents: boolean
  can_comment: boolean
}

const defaultPermissions: SharePermissions = {
  can_view_bmc: true,
  can_view_business_plan: false,
  can_view_documents: false,
  can_comment: false,
}

export function ShareDialog({
  projectId, projectName, shares,
  onCreateShare, onRevokeShare, loading,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [permissions, setPermissions] = useState<SharePermissions>(defaultPermissions)
  const [expiryDays, setExpiryDays] = useState(7)
  const [customExpiry, setCustomExpiry] = useState('')
  const [useExpiry, setUseExpiry] = useState(true)
  const [creating, setCreating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)

  const togglePermission = (key: keyof SharePermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const getExpiresAt = (): string | undefined => {
    if (!useExpiry) return undefined
    if (customExpiry) return new Date(customExpiry).toISOString()
    const d = new Date()
    d.setDate(d.getDate() + expiryDays)
    return d.toISOString()
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      await onCreateShare(permissions, getExpiresAt())
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const shareUrl = `${baseUrl}/share/${projectId}`
      setGeneratedLink(shareUrl)
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.getElementById('share-link-input') as HTMLInputElement
      if (input) { input.select(); document.execCommand('copy') }
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    try {
      await onRevokeShare(revokeTarget)
      setRevokeTarget(null)
    } finally {
      setRevokeTarget(null)
    }
  }

  const getExpiryLabel = (share: ProjectShare): string => {
    if (!share.expires_at) return 'Aucune expiration'
    const exp = new Date(share.expires_at)
    const now = new Date()
    const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Expiré'
    if (days === 0) return 'Expire aujourd\'hui'
    return `Expire dans ${days} jour${days > 1 ? 's' : ''}`
  }

  const permissionLabels: { key: keyof SharePermissions; label: string }[] = [
    { key: 'can_view_bmc', label: 'Voir le BMC' },
    { key: 'can_view_business_plan', label: 'Voir le business plan' },
    { key: 'can_view_documents', label: 'Voir les documents' },
    { key: 'can_comment', label: 'Commenter' },
  ]

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Share2 size={12} /> Partager
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Partager « ${projectName} »`} className="max-w-lg">
        <div className="space-y-5">
          {/* Permissions */}
          <div>
            <h4 className="text-[11px] font-bold text-ink mb-2">Permissions</h4>
            <div className="space-y-2">
              {permissionLabels.map((p) => (
                <div key={p.key} className="flex items-center justify-between py-1">
                  <span className="text-[12px] text-ink2">{p.label}</span>
                  <Toggle
                    on={permissions[p.key]}
                    onToggle={() => togglePermission(p.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Expiry */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold text-ink">Expiration</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-ink3">Activer</span>
                <Toggle on={useExpiry} onToggle={() => setUseExpiry(!useExpiry)} />
              </div>
            </div>
            {useExpiry && (
              <div className="flex items-center gap-2">
                <select
                  value={expiryDays}
                  onChange={(e) => { setExpiryDays(Number(e.target.value)); setCustomExpiry('') }}
                  className="flex-1 text-[11px] px-2 py-1.5 border border-border rounded-lg bg-surface text-ink outline-none font-dm"
                >
                  <option value={1}>1 jour</option>
                  <option value={7}>7 jours</option>
                  <option value={14}>14 jours</option>
                  <option value={30}>30 jours</option>
                  <option value={0}>Personnalisé</option>
                </select>
                {expiryDays === 0 && (
                  <input
                    type="date"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    className="flex-1 text-[11px] px-2 py-1.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss font-dm"
                  />
                )}
              </div>
            )}
          </div>

          {/* Generate */}
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleCreate}
            loading={creating}
            disabled={!Object.values(permissions).some(Boolean)}
          >
            <Share2 size={12} /> Générer le lien de partage
          </Button>

          {/* Generated link */}
          {generatedLink && (
            <Card className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Link2 size={14} className="text-moss flex-shrink-0" />
                <input
                  id="share-link-input"
                  value={generatedLink}
                  readOnly
                  className="flex-1 text-[11px] px-2 py-1.5 bg-moss/[.06] border border-moss/20 rounded-md text-ink font-mono outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    copied ? 'bg-moss text-white' : 'bg-moss/[.08] text-moss hover:bg-moss-light',
                  )}
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] text-moss font-semibold">Lien copié dans le presse-papier !</p>
              )}
            </Card>
          )}

          {/* Existing shares */}
          <div>
            <h4 className="text-[11px] font-bold text-ink mb-2">Partages actifs ({shares.length})</h4>
            {shares.length === 0 ? (
              <EmptyState
                icon={<Globe size={20} />}
                title="Aucun partage"
                description="Partagez ce projet avec des collaborateurs externes."
              />
            ) : (
              <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                {shares.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-2 border border-border text-[11px]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-ink font-semibold text-[10px]">
                          {s.share_token.slice(0, 12)}...
                        </span>
                        {!s.is_active && <Badge variant="red">Révoqué</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-ink3">
                        <span className="flex items-center gap-1">
                          <Calendar size={9} /> {new Date(s.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span>{getExpiryLabel(s)}</span>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        {Object.entries(s.permissions).filter(([, v]) => v).map(([key]) => (
                          <Badge key={key} variant="gray">
                            {permissionLabels.find(p => p.key === key)?.label || key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {s.is_active && (
                      <button
                        onClick={() => setRevokeTarget(s.id)}
                        className="p-1.5 rounded-md text-ink3 hover:text-red hover:bg-red-light transition-colors flex-shrink-0 ml-2"
                        title="Révoquer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Revoke confirmation */}
      <Modal
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        title="Révoquer le partage"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-ink2">
            Ce lien de partage ne sera plus accessible. Les collaborateurs utilisant ce lien perdront l'accès au projet.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setRevokeTarget(null)}>
              Annuler
            </Button>
            <Button variant="danger" size="sm" onClick={handleRevoke}>
              <Trash2 size={12} /> Révoquer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
