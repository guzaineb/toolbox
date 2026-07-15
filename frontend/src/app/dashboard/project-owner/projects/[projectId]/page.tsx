'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, TreePine, BarChart3, Leaf, DollarSign,
  Target, LineChart, Loader2, ChevronRight, Check, FileText,
} from 'lucide-react'
import { Card, CardHeader, Badge, Progress, Button } from '@/components/shared/ui'
import { gbmService } from '@/services/gbm.service'
import api from '@/services/api'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description?: string
  is_gbm_reviewed?: boolean
  gbm_reviewed_at?: string
}

const MODULES = [
  { key: 'gbm',          label: 'Modèle d\'Affaires Vert',   icon: TreePine,   color: 'text-moss',      bg: 'bg-moss-light' },
  { key: 'business-plan',label: 'Plan d\'Affaires Vert',      icon: BarChart3,  color: 'text-amber',     bg: 'bg-amber-light' },
  { key: 'eco-design',   label: 'Éco-conception',             icon: Leaf,       color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'funding',      label: 'Accès au Financement',       icon: DollarSign, color: 'text-blue-600',  bg: 'bg-blue-50' },
  { key: 'market',       label: 'Accès au Marché',            icon: Target,     color: 'text-purple-600',bg: 'bg-purple-50' },
  { key: 'impact',       label: 'Mesure de l\'Impact',        icon: LineChart,  color: 'text-orange-600',bg: 'bg-orange-50' },
  { key: 'documents',    label: 'Documents',                   icon: FileText,   color: 'text-teal-600',  bg: 'bg-teal-50' },
]

export default function ProjectDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [project, setProject] = useState<Project | null>(null)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: p } = await api.get(`/projects/${projectId}`)
        if (p) setProject(p)

        const prog: Record<string, number> = {}
        const gbmProg = await gbmService.getProgress(projectId)
        prog.gbm = gbmProg.percentage
        setProgress(prog)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-moss" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-14">
        <p className="text-sm text-ink3">Projet introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.push('/dashboard/project-owner/projects')} className="mt-1 p-1 hover:bg-moss-light rounded-lg">
          <ArrowLeft size={18} className="text-ink3" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-syne text-xl font-extrabold text-ink">{project.name}</h1>
            {project.is_gbm_reviewed && <Badge variant="green">GBM ✓</Badge>}
          </div>
          {project.description && <p className="text-sm text-ink3 mt-1">{project.description}</p>}
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs font-semibold text-ink2 mb-2">Progression globale</div>
            <Progress value={progress.gbm || 0} />
          </div>
          <div className="text-lg font-extrabold text-moss">{progress.gbm || 0}%</div>
        </div>
      </Card>

      {/* Module Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {MODULES.map(mod => {
          const Icon = mod.icon
          const isLocked = !['gbm', 'documents'].includes(mod.key) && !project.is_gbm_reviewed
          return (
            <Card
              key={mod.key}
              className={cn(
                'p-0 overflow-hidden transition-all',
                isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md',
              )}
              onClick={() => !isLocked && router.push(`/dashboard/project-owner/projects/${projectId}/${mod.key}`)}
            >
              <CardHeader
                icon={
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', mod.bg)}>
                    <Icon size={14} className={mod.color} />
                  </div>
                }
                title={mod.label}
              >
                <ChevronRight size={14} className="text-ink3" />
              </CardHeader>
              <div className="p-4 flex items-center gap-3">
                <Progress value={mod.key === 'gbm' ? (progress.gbm || 0) : 0} />
                <span className="text-xs font-bold text-moss flex-shrink-0">
                  {mod.key === 'gbm' ? `${progress.gbm || 0}%` : '—'}
                </span>
                {isLocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-ink/10 text-ink3 font-semibold">
                    GBM requis
                  </span>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* GBM Review Callout */}
      {!project.is_gbm_reviewed && (progress.gbm || 0) >= 80 && (
        <Card className="p-4 border-2 border-amber/30 bg-amber-light/20">
          <div className="flex items-start gap-3">
            <Check size={18} className="text-amber mt-0.5" />
            <div>
              <p className="text-sm font-bold text-ink">GBM presque complet !</p>
              <p className="text-xs text-ink2 mt-1">
                Finalisez la Phase 4 puis validez la révision GBM pour débloquer les autres modules.
              </p>
              <Button
                size="sm"
                variant="amber"
                className="mt-3"
                onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}/gbm`)}
              >
                Aller à la révision GBM
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
