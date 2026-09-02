'use client'

import { Suspense, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, FileDown } from 'lucide-react'
import { GbmWizard } from '@/components/gbm/GbmWizard'
import { Button } from '@/components/shared/ui'
import { gbmService } from '@/services/gbm.service'

function GbmPageContent() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [pdfLoading, setPdfLoading] = useState(false)
  const leaveRef = useRef<((action: () => void) => void) | null>(null)

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    try {
      const blob = await gbmService.downloadBmcPdf(projectId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bmc-${projectId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      // silent
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => (leaveRef.current ? leaveRef.current(() => router.back()) : router.back())} className="p-1 hover:bg-moss-light rounded-lg">
          <ArrowLeft size={18} className="text-ink3" />
        </button>
        <div className="flex-1">
          <h1 className="font-syne text-lg font-extrabold text-ink">Modèle d&apos;Affaires Vert</h1>
          <p className="text-xs text-ink3">5 phases · 24 étapes</p>
        </div>
        <Button variant="outline" onClick={handleDownloadPdf} loading={pdfLoading}>
          <FileDown size={14} /> Télécharger BMC (PDF)
        </Button>
      </div>
      <GbmWizard projectId={projectId} onRegisterLeave={(fn) => { leaveRef.current = fn }} />
    </div>
  )
}

export default function GbmPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-ink3">Chargement du GBM…</div>}>
      <GbmPageContent />
    </Suspense>
  )
}
