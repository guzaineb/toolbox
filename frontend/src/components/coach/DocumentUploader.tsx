'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/shared/ui'
import { uploadDocument, deleteDocument } from '@/services/coach.service'
import type { UploadedDocument } from '@/types/coach'

export default function DocumentUploader({
  projectId,
  documents,
  onUploaded,
  onIndex,
}: {
  projectId: string
  documents: UploadedDocument[]
  onUploaded: () => void
  onIndex: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        await uploadDocument(projectId, file)
        onUploaded()
      } catch {
        // silent
      } finally {
        setUploading(false)
      }
    },
    [projectId, onUploaded],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ''
    },
    [handleFile],
  )

  const handleDelete = useCallback(
    async (docId: string) => {
      try {
        await deleteDocument(docId, projectId)
        onUploaded()
      } catch {
        // silent
      }
    },
    [projectId, onUploaded],
  )

  const statusIcon = (status: string) => {
    switch (status) {
      case 'INDEXED':
        return <CheckCircle className="w-3 h-3 text-moss" />
      case 'FAILED':
        return <AlertCircle className="w-3 h-3 text-red" />
      case 'PROCESSING':
        return <Loader2 className="w-3 h-3 text-amber animate-spin" />
      default:
        return <FileText className="w-3 h-3 text-ink3" />
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          dragOver
            ? 'border-moss bg-moss-light/30'
            : 'border-ink/[.12] hover:border-moss/30 hover:bg-ink/[.02]',
        )}
      >
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md"
          onChange={handleInputChange}
          className="hidden"
          id="coach-file-upload"
        />
        <label htmlFor="coach-file-upload" className="cursor-pointer flex items-center gap-2">
          {uploading ? (
            <Loader2 className="w-4 h-4 text-moss animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-ink3" />
          )}
          <span className="text-[11px] text-ink3 font-dm">
            {uploading ? 'Envoi…' : 'Glissez un fichier ou cliquez pour envoyer'}
          </span>
        </label>
      </div>

      {documents.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-ink3 font-dm uppercase tracking-wider">
              Documents ({documents.length})
            </span>
            <button
              onClick={onIndex}
              className="text-[10px] text-moss hover:text-moss-mid font-dm font-medium transition-colors"
            >
              Réindexer
            </button>
          </div>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-ink/[.02] border border-ink/[.05]"
            >
              {statusIcon(doc.status)}
              <span className="text-[10px] text-ink2 font-dm truncate flex-1">
                {doc.originalName}
              </span>
              <span className="text-[9px] text-ink3 font-dm">
                {(doc.size / 1024).toFixed(0)}KB
              </span>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-0.5 rounded hover:bg-red-light/50 text-ink3 hover:text-red transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
