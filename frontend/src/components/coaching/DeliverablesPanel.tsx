'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  FileText, Download, Eye, Check, RefreshCw, Clock, Loader2, X,
  FolderCheck, ChevronUp,
} from 'lucide-react'
import { Badge, Button, Card, ErrorAlert } from '@/components/shared/ui'
import { documentsService, type GeneratedDocument } from '@/services/documents.service'
import { gbmService } from '@/services/gbm.service'
import { getErrorMessage } from '@/lib/utils'
import type { GbmProgress } from '@/types/gbm'

const PHASE_NAMES: Record<number, string> = {
  1: 'Ébaucher & Définir',
  2: 'Construire',
  3: 'Tester',
  4: 'Mesurer & Améliorer',
  5: 'Synthèse',
}

const DOC_ICONS: Record<string, string> = {
  Lightbulb: '💡', AlertTriangle: '⚠️', Globe: '🌍', Target: '🎯', Compass: '🧭',
  Users: '👥', UserCheck: '✅', Gem: '💎', FlaskConical: '🧪', Route: '🗺️',
  LayoutGrid: '📊', ClipboardList: '📋', Megaphone: '📣', DollarSign: '💰',
  Scale: '⚖️', BarChart3: '📈', FileText: '📄', Leaf: '🍃', Wallet: '👛',
  Activity: '📊', MegaphoneIcon: '📣',
}

const STATUS_CONFIG = {
  NOT_GENERATED: { label: 'Non généré', variant: 'gray' as const },
  GENERATED: { label: 'Généré', variant: 'green' as const },
  UPDATED: { label: 'Mis à jour', variant: 'amber' as const },
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/**
 * Vue lecture seule des livrables du projet pour le coach / jury :
 * progression GBM par phase + les 21 documents générés par IA (consultation + PDF),
 * sans aucune action de génération réservée au porteur.
 */
export function DeliverablesPanel({ projectId }: { projectId: string }) {
  const [documents, setDocuments] = useState<GeneratedDocument[] | null>(null)
  const [progress, setProgress] = useState<GbmProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<GeneratedDocument | null>(null)
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [docs, prog] = await Promise.all([
        documentsService.getDocumentsList(projectId),
        gbmService.getProgress(projectId).catch(() => null),
      ])
      setDocuments(docs)
      setProgress(prog)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { load() }, [load])

  const openPreview = async (doc: GeneratedDocument) => {
    setError(null)
    setLoadingPreview(doc.key)
    try {
      const full = await documentsService.getDocument(projectId, doc.key)
      setPreviewDoc(full)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingPreview(null)
    }
  }

  const downloadPdf = async (key: string, title: string) => {
    setError(null)
    setDownloading(key)
    try {
      const blob = await documentsService.downloadPdf(projectId, key)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${key}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      setError(`Erreur lors du téléchargement de « ${title} »`)
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Loader2 size={22} className="animate-spin text-moss" />
      </Card>
    )
  }

  if (error && !documents) {
    return (
      <div className="space-y-3">
        <ErrorAlert message={error} />
        <Button size="sm" variant="outline" onClick={load}>Réessayer</Button>
      </div>
    )
  }

  const docs = documents ?? []
  const generatedCount = docs.filter((d) => d.status !== 'NOT_GENERATED').length

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} />}

      {/* Progression GBM */}
      {progress && (
        <Card className="p-[16px_18px]">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="font-syne text-[13px] font-bold text-ink">Progression GBM</div>
            <Badge variant={progress.percentage >= 80 ? 'green' : progress.percentage >= 40 ? 'amber' : 'gray'}>
              {progress.percentage}% complété
            </Badge>
          </div>
          <div className="w-full h-[6px] bg-surface-2 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-moss rounded-full transition-all" style={{ width: `${progress.percentage}%` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {progress.phases.map((p) => (
              <div key={p.phase} className="bg-surface-2/60 border border-border rounded-[10px] p-2.5">
                <div className="text-[10px] font-semibold text-ink3 uppercase tracking-[0.05em] truncate">
                  P{p.phase} · {PHASE_NAMES[p.phase] ?? ''}
                </div>
                <div className="text-[13px] font-extrabold text-ink mt-0.5">{p.completed}/{p.total}</div>
                <div className="w-full h-[3px] bg-border rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-moss rounded-full" style={{ width: `${p.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Documents */}
      <Card className="overflow-hidden">
        <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink flex items-center justify-between">
          <span>Livrables du projet</span>
          <span className="text-[11px] text-ink3 font-medium">
            {generatedCount}/{docs.length} générés · consultation seule
          </span>
        </div>

        <div className="divide-y divide-border">
          {docs.length === 0 ? (
            <div className="text-center py-12">
              <FolderCheck size={26} className="mx-auto text-ink3 mb-2" />
              <p className="text-[12px] text-ink3">Aucun livrable défini pour ce projet</p>
            </div>
          ) : (
            docs.map((doc) => {
              const cfg = STATUS_CONFIG[doc.status]
              const isOpen = expanded === doc.key
              return (
                <div key={doc.key}>
                  <div className="flex items-center gap-3 px-[18px] py-[11px] hover:bg-surface-2/40 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0 text-[15px]">
                      {DOC_ICONS[doc.icon] || '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12.5px] font-semibold text-ink truncate">{doc.title}</span>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      <div className="text-[10.5px] text-ink3 mt-0.5">
                        {doc.generatedAt ? `Généré le ${formatDate(doc.generatedAt)}` : 'Pas encore généré'}
                        {doc.updatedAt && doc.status === 'UPDATED' && ` · Modifié le ${formatDate(doc.updatedAt)}`}
                      </div>
                    </div>
                    {doc.status !== 'NOT_GENERATED' && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isOpen ? (
                          <Button size="sm" variant="ghost" onClick={() => setExpanded(null)}>
                            <ChevronUp size={14} /> Réduire
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            loading={loadingPreview === doc.key}
                            onClick={() => (doc.content ? setExpanded(doc.key) : openPreview(doc))}
                          >
                            <Eye size={13} /> Consulter
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={downloading === doc.key}
                          onClick={() => downloadPdf(doc.key, doc.title)}
                        >
                          <Download size={13} /> PDF
                        </Button>
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <div className="px-[18px] pb-[14px]">
                      <div className="relative bg-surface border border-border rounded-[10px] p-4 max-h-[320px] overflow-y-auto">
                        <button
                          onClick={() => setExpanded(null)}
                          className="absolute top-2 right-2 p-1 rounded-md text-ink3 hover:text-ink hover:bg-surface-2"
                        >
                          <X size={12} />
                        </button>
                        <pre className="text-[11.5px] leading-relaxed text-ink2 whitespace-pre-wrap font-sans pr-6">
                          {doc.content || 'Contenu indisponible'}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Modal plein écran */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-6"
          onClick={(e) => e.target === e.currentTarget && setPreviewDoc(null)}
        >
          <div className="bg-surface rounded-2xl shadow-lg max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-moss flex-shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-syne text-[15px] font-bold text-ink truncate">{previewDoc.title}</h2>
                  <p className="text-[11px] text-ink3 mt-0.5">Généré le {formatDate(previewDoc.generatedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => previewDoc && downloadPdf(previewDoc.key, previewDoc.title)}
                >
                  <Download size={13} /> PDF
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPreviewDoc(null)}>
                  <X size={15} />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="text-[12.5px] leading-relaxed text-ink whitespace-pre-wrap">
                {previewDoc.content || 'Aucun contenu disponible'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Récap statuts en pied de panneau */}
      {docs.length > 0 && generatedCount === 0 && (
        <div className="flex items-center justify-center gap-2 text-[11px] text-ink3">
          <Clock size={12} /> Le porteur n&apos;a pas encore généré ses livrables.
        </div>
      )}
      {generatedCount > 0 && (
        <div className="flex items-center justify-center gap-2 text-[11px] text-ink3">
          <Check size={12} className="text-moss" />
          {generatedCount} livrable(s) consultable(s)
          <RefreshCw size={10} className="ml-1 opacity-60" /> contenu en lecture seule
        </div>
      )}
    </div>
  )
}
