'use client'

import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FileText, Trash2, Eye, Check, X, AlertCircle, Upload } from 'lucide-react'
import api from '@/services/api'
import { Badge, Button, Card, CardHeader, ErrorAlert, Field, Select, UploadZone } from '@/components/shared/ui'

interface Doc {
  id: string
  document_type: string
  file_url: string
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED'
  uploaded_at?: string
  uploaded_by_user_id?: string
  rejection_reason?: string
  uploaded_by?: {
    id: string
    first_name: string
    last_name: string
    role: string
  }
}

const DOC_TYPES = [
  { value: 'commerce_register', label: 'Registre de commerce' },
  { value: 'legal_doc', label: 'Document légal' },
  { value: 'tax_certificate', label: 'Attestation fiscale' },
  { value: 'institutional_proof', label: 'Preuve institutionnelle' },
]

const STATUS_BADGE: Record<string, 'amber' | 'green' | 'red'> = {
  PENDING: 'amber', APPROVED: 'green', REJECTED: 'red',
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Rejeté',
}

const DOC_ICONS: Record<string, string> = {
  commerce_register: '📋',
  legal_doc: '⚖️',
  tax_certificate: '📃',
  institutional_proof: '🏛️',
}

export default function DocumentsPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [docType, setDocType] = useState('commerce_register')
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = () => {
    if (!incubatorId) return
    setLoading(true)
    api.get(`/incubators/${incubatorId}/documents`)
      .then((res) => setDocs(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDocs() }, [incubatorId])

  const handleUpload = async (file: File) => {
    setError(null)
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('document_type', docType)
    try {
      await api.post(`/incubators/${incubatorId}/documents/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      fetchDocs()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleDelete = async (docId: string) => {
    setError(null)
    setDeletingId(docId)
    try {
      await api.delete(`/incubators/${incubatorId}/documents/${docId}`)
      fetchDocs()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const handleVerify = async (docId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    setError(null)
    setVerifyingId(docId)
    try {
      await api.patch(`/incubators/${incubatorId}/documents/${docId}/verify`, {
        verification_status: status,
        rejection_reason: reason,
      })
      fetchDocs()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur vérification')
    } finally {
      setVerifyingId(null)
      setRejectingId(null)
      setRejectReason('')
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">Documents</h1>
      <p className="text-[12px] text-ink3 mb-7">Uploadez les documents pour la vérification de votre incubateur</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      {/* Upload */}
      <Card className="mb-5 p-0 overflow-hidden">
        <CardHeader icon={<Upload size={13} />} title="Ajouter un document" />
        <div className="p-[18px] space-y-4">
          <Field label="Type de document">
            <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <div onClick={() => fileInputRef.current?.click()}>
            <UploadZone />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
          />
          {uploading && <p className="text-[12px] text-ink3 text-center animate-pulse">Envoi en cours…</p>}
        </div>
      </Card>

      {/* List */}
      <Card className="p-0 overflow-hidden">
        <CardHeader icon={<FileText size={13} />} title={`Documents soumis (${docs.length})`} />
        <div className="p-[18px]">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-12 bg-border rounded-lg" />)}
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-10">
              <FileText size={32} className="mx-auto text-ink3 mb-3" />
              <p className="text-[13px] text-ink3">Aucun document soumis pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {docs.map((doc) => {
                const typeLabel = DOC_TYPES.find((t) => t.value === doc.document_type)?.label ?? doc.document_type
                const isVerifying = verifyingId === doc.id
                const isDeleting = deletingId === doc.id

                return (
                  <div key={doc.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="text-[20px] flex-shrink-0">{DOC_ICONS[doc.document_type] ?? '📄'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink truncate">{typeLabel}</div>
                        <div className="text-[11px] text-ink3">
                          {doc.uploaded_at && new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                          {doc.uploaded_by && ` · ${doc.uploaded_by.first_name} ${doc.uploaded_by.last_name}`}
                        </div>
                      </div>

                      <Badge variant={STATUS_BADGE[doc.verification_status] ?? 'gray'}>
                        {STATUS_LABEL[doc.verification_status] ?? doc.verification_status}
                      </Badge>

                      <a href={`${process.env.NEXT_PUBLIC_API_URL}${doc.file_url}`} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost"><Eye size={13} /></Button>
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!text-red hover:!bg-red-light"
                        loading={isDeleting}
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>

                    {doc.verification_status === 'REJECTED' && doc.rejection_reason && (
                      <div className="mt-3 ml-9 p-3 rounded-lg bg-red-light border border-red/18 text-red text-[12px] flex items-start gap-2">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        {doc.rejection_reason}
                      </div>
                    )}

                    {doc.verification_status === 'PENDING' && (
                      <div className="flex gap-2 mt-3 ml-9">
                        {rejectingId === doc.id ? (
                          <div className="flex flex-col gap-2 w-full">
                            <textarea
                              className="w-full p-2 text-[13px] border border-border rounded-lg bg-surface focus:border-moss focus:shadow-[0_0_0_3px_rgba(45,122,82,0.09)] outline-none transition-all resize-none"
                              rows={2}
                              placeholder="Raison du rejet (obligatoire)"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-red text-white hover:bg-red-dark border-red"
                                loading={isVerifying}
                                onClick={() => {
                                  if (!rejectReason.trim()) {
                                    setError('Veuillez indiquer une raison de rejet')
                                    return
                                  }
                                  handleVerify(doc.id, 'REJECTED', rejectReason)
                                }}
                              >
                                Confirmer le rejet
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setRejectReason('') }}>
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              loading={isVerifying}
                              onClick={() => handleVerify(doc.id, 'APPROVED')}
                            >
                              <Check size={12} />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="!text-red !border-red/25 hover:!bg-red-light"
                              onClick={() => setRejectingId(doc.id)}
                            >
                              <X size={12} />
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}