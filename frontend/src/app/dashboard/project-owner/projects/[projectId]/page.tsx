'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, TreePine, BarChart3, Leaf, DollarSign,
  Target, LineChart, Loader2, ChevronRight, Check, FileText,
  HeartHandshake, ClipboardCheck,
} from 'lucide-react'
import { Card, CardHeader, Badge, Progress, Button } from '@/components/shared/ui'
import { gbmService } from '@/services/gbm.service'
import { businessPlanService } from '@/services/business-plan.service'
import { ecoDesignService } from '@/services/eco-design.service'
import { marketService } from '@/services/market.service'
import { impactService } from '@/services/impact.service'
import { fundingService } from '@/services/funding.service'
import api from '@/services/api'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description?: string
  is_gbm_reviewed?: boolean
  gbm_reviewed_at?: string
}

interface ModuleDef {
  key: string
  label: string
  icon: any
  color: string
  bg: string
  followUp?: boolean
}

const MODULES: ModuleDef[] = [
  { key: 'gbm',          label: 'Modèle d\'Affaires Vert',   icon: TreePine,   color: 'text-moss',      bg: 'bg-moss-light' },
  { key: 'business-plan',label: 'Plan d\'Affaires Vert',      icon: BarChart3,  color: 'text-amber',     bg: 'bg-amber-light' },
  { key: 'eco-design',   label: 'Éco-conception',             icon: Leaf,       color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'funding',      label: 'Accès au Financement',       icon: DollarSign, color: 'text-blue-600',  bg: 'bg-blue-50' },
  { key: 'market',       label: 'Accès au Marché',            icon: Target,     color: 'text-purple-600',bg: 'bg-purple-50' },
  { key: 'impact',       label: 'Mesure de l\'Impact',        icon: LineChart,  color: 'text-orange-600',bg: 'bg-orange-50' },
  { key: 'documents',    label: 'Documents',                   icon: FileText,   color: 'text-teal-600',  bg: 'bg-teal-50' },
  { key: 'coachings',    label: 'Suivi coaching',              icon: HeartHandshake, color: 'text-moss', bg: 'bg-moss-light', followUp: true },
  { key: 'evaluations',  label: 'Évaluation & décision',       icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50', followUp: true },
]

const PROGRESS_MODULE_KEYS = ['gbm', 'business-plan', 'eco-design', 'funding', 'market', 'impact']

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

        const [gbm, bp, eco, market, impact, funding] = await Promise.allSettled([
          gbmService.getProgress(projectId),
          businessPlanService.getProgress(projectId),
          ecoDesignService.getProgress(projectId),
          marketService.getProgress(projectId),
          impactService.getProgress(projectId),
          fundingService.getAssessment(projectId),
        ])

        const prog: Record<string, number> = {}
        if (gbm.status === 'fulfilled') prog.gbm = gbm.value.percentage ?? 0
        if (bp.status === 'fulfilled') prog['business-plan'] = bp.value.percentage ?? 0
        if (eco.status === 'fulfilled') prog['eco-design'] = eco.value.percentage ?? 0
        if (market.status === 'fulfilled') prog.market = market.value.percentage ?? 0
        if (impact.status === 'fulfilled') prog.impact = impact.value.percentage ?? 0
        if (funding.status === 'fulfilled') {
          const score = funding.value.score_maturite ?? 0
          prog.funding = score > 0 ? Math.round((score / 12) * 100) : 0
        }
        setProgress(prog)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [projectId])

  const overall = Math.round(
    PROGRESS_MODULE_KEYS.reduce((sum, key) => sum + (progress[key] || 0), 0) /
      PROGRESS_MODULE_KEYS.length,
  )

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
            <div className="text-xs font-semibold text-ink2 mb-2">Progression globale (tous modules)</div>
            <Progress value={overall} />
          </div>
          <div className="text-lg font-extrabold text-moss">{overall}%</div>
        </div>
      </Card>

      {/* Module Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {MODULES.map(mod => {
          const Icon = mod.icon
          const isLocked = !['gbm', 'documents'].includes(mod.key) && !mod.followUp && !project.is_gbm_reviewed
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
                {mod.followUp ? (
                  <span className="text-xs text-ink3">Suivi par l'incubateur et les experts</span>
                ) : mod.key === 'documents' ? (
                  <span className="text-xs font-bold text-moss flex-shrink-0">—</span>
                ) : (
                  <>
                    <Progress value={progress[mod.key] || 0} />
                    <span className="text-xs font-bold text-moss flex-shrink-0">
                      {progress[mod.key] || 0}%
                    </span>
                    {progress[mod.key] === 100 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-moss/10 text-moss font-bold">
                        Complet ✓
                      </span>
                    )}
                  </>
                )}
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
