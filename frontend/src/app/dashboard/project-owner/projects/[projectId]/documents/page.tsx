'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, FileText, Download, RefreshCw, Loader2, Check,
  Eye, Sparkles, AlertCircle, Clock,
} from 'lucide-react'
import { Card, CardHeader, Button, Badge, ErrorAlert, SuccessAlert } from '@/components/shared/ui'
import { documentsService, type GeneratedDocument } from '@/services/documents.service'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, any> = {
  Lightbulb: () => <span className="text-yellow-500">💡</span>,
  AlertTriangle: () => <span className="text-orange-500">⚠️</span>,
  Globe: () => <span className="text-blue-500">🌍</span>,
  Target: () => <span className="text-red-500">🎯</span>,
  Compass: () => <span className="text-indigo-500">🧭</span>,
  Users: () => <span className="text-purple-500">👥</span>,
  UserCheck: () => <span className="text-green-500">✅</span>,
  Gem: () => <span className="text-pink-500">💎</span>,
  FlaskConical: () => <span className="text-cyan-500">🧪</span>,
  Route: () => <span className="text-amber-500">🗺️</span>,
  LayoutGrid: () => <span className="text-moss">📊</span>,
  ClipboardList: () => <span className="text-blue-600">📋</span>,
  Megaphone: () => <span className="text-orange-600">📣</span>,
  DollarSign: () => <span className="text-green-600">💰</span>,
  Scale: () => <span className="text-gray-600">⚖️</span>,
  BarChart3: () => <span className="text-teal-500">📈</span>,
  FileText: () => <span className="text-moss">📄</span>,
  Leaf: () => <span className="text-green-500">🍃</span>,
  Wallet: () => <span className="text-blue-500">👛</span>,
  Activity: () => <span className="text-red-500">📊</span>,
}

const STATUS_CONFIG = {
  NOT_GENERATED: { label: 'Non généré', variant: 'gray' as const, icon: Clock },
  GENERATED: { label: 'Généré', variant: 'green' as const, icon: Check },
  UPDATED: { label: 'Mis à jour', variant: 'amber' as const, icon: RefreshCw },
}

export default function DocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [documents, setDocuments] = useState<GeneratedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewDoc, setPreviewDoc] = useState<GeneratedDocument | null>(null)

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await documentsService.getDocumentsList(projectId)
      setDocuments(docs)
    } catch {
      setError('Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { loadDocuments() }, [loadDocuments])

  const handleGenerate = async (key: string) => {
    setGenerating(key)
    setError('')
    setSuccess('')
    try {
      const doc = await documentsService.generateDocument(projectId, key)
      setDocuments(prev => prev.map(d => d.key === key ? { ...d, ...doc } : d))
      setSuccess(`Document "${doc.title}" généré avec succès`)
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Erreur lors de la génération du document')
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateAll = async () => {
    setGeneratingAll(true)
    setError('')
    setSuccess('')
    try {
      await documentsService.generateAllDocuments(projectId)
      await loadDocuments()
      setSuccess('Tous les documents ont été générés')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Erreur lors de la génération des documents')
    } finally {
      setGeneratingAll(false)
    }
  }

  const handleDownloadPdf = async (key: string) => {
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
      setError('Erreur lors du téléchargement du PDF')
    }
  }

  const handlePreview = async (key: string) => {
    try {
      const doc = await documentsService.getDocument(projectId, key)
      setPreviewDoc(doc)
    } catch {
      setError('Erreur lors du chargement du document')
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const generatedCount = documents.filter(d => d.status !== 'NOT_GENERATED').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-moss" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.back()} className="mt-1 p-1 hover:bg-moss-light rounded-lg">
          <ArrowLeft size={18} className="text-ink3" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-syne text-xl font-extrabold text-ink">Documents</h1>
          <p className="text-sm text-ink3 mt-1">
            {generatedCount}/{documents.length} documents générés
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleGenerateAll}
          loading={generatingAll}
        >
          <Sparkles size={14} /> Générer tous
        </Button>
      </div>

      {/* Alerts */}
      {error && <ErrorAlert message={error} className="mb-4" />}
      {success && <SuccessAlert message={success} className="mb-4" />}

      {/* Documents List */}
      <div className="space-y-2">
        {documents.map(doc => {
          const statusCfg = STATUS_CONFIG[doc.status]
          const StatusIcon = statusCfg.icon
          const DocIcon = ICON_MAP[doc.icon] || (() => <FileText size={16} className="text-ink3" />)

          return (
            <Card key={doc.key} className="p-0 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                  <DocIcon />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink truncate">{doc.title}</h3>
                    <Badge variant={statusCfg.variant}>
                      <StatusIcon size={10} className="mr-1" />
                      {statusCfg.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-ink3">
                    {doc.generatedAt && (
                      <span>Généré: {formatDate(doc.generatedAt)}</span>
                    )}
                    {doc.updatedAt && doc.status === 'UPDATED' && (
                      <span>Modifié: {formatDate(doc.updatedAt)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {doc.status !== 'NOT_GENERATED' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePreview(doc.key)}
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadPdf(doc.key)}
                      >
                        <Download size={14} />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant={doc.status === 'NOT_GENERATED' ? 'primary' : 'outline'}
                    onClick={() => handleGenerate(doc.key)}
                    loading={generating === doc.key}
                  >
                    {doc.status === 'NOT_GENERATED' ? (
                      <><Sparkles size={12} className="mr-1" /> Générer</>
                    ) : (
                      <><RefreshCw size={12} className="mr-1" /> Régénérer</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-syne text-lg font-bold text-ink">{previewDoc.title}</h2>
                <p className="text-xs text-ink3 mt-1">
                  Généré le {formatDate(previewDoc.generatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleDownloadPdf(previewDoc.key)}>
                  <Download size={14} /> PDF
                </Button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 hover:bg-surface-2 rounded-lg text-ink3"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="prose prose-sm max-w-none text-ink text-sm leading-relaxed whitespace-pre-wrap">
                {previewDoc.content || 'Aucun contenu disponible'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
