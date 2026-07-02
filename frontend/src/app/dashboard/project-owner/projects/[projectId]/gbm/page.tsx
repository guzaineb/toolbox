'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { GbmStepper } from '@/components/gbm/GbmStepper'
import { Button } from '@/components/shared/ui'

export default function GbmPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 hover:bg-moss-light rounded-lg">
          <ArrowLeft size={18} className="text-ink3" />
        </button>
        <div>
          <h1 className="font-syne text-lg font-extrabold text-ink">Modèle d&apos;Affaires Vert</h1>
          <p className="text-xs text-ink3">4 phases · 20 étapes</p>
        </div>
      </div>
      <GbmStepper projectId={projectId} />
    </div>
  )
}
