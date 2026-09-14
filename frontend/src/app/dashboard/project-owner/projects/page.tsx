'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderKanban, ArrowRight, Loader2 } from 'lucide-react'
import { Button, Card, ErrorAlert, Progress } from '@/components/shared/ui'
import { gbmService } from '@/services/gbm.service'
import { projectService } from '@/services/project.service'
import type { Project } from '@/services/project.service'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [progresses, setProgresses] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadProjects = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const typedProjects = await projectService.list()

      setProjects(typedProjects)

      const progMap: Record<string, number> = {}
      await Promise.allSettled(
        typedProjects.map(async (p) => {
          const prog = await gbmService.getProgress(p.id)
          progMap[p.id] = prog.percentage ?? 0
        }),
      )
      setProgresses(progMap)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      await projectService.create(newName)
      setNewName('')
      setShowCreate(false)
      await loadProjects()
    } catch {
      setCreateError('Impossible de créer le projet. Veuillez réessayer.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-moss" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-xl font-extrabold text-ink">Mes projets</h1>
          <p className="text-sm text-ink3 mt-1">Gérez vos projets entrepreneuriaux verts</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Nouveau projet
        </Button>
      </div>

      {loadError && (
        <ErrorAlert message="Impossible de charger vos projets. Réessayez ou vérifiez votre connexion." />
      )}

      {createError && <ErrorAlert message={createError} />}

      {showCreate && (
        <Card className="p-4 border-2 border-moss/30">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-ink2 mb-1">Nom du projet</label>
              <input
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Éco-Emballages Vert"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <Button variant="primary" onClick={handleCreate} loading={creating} disabled={!newName.trim()}>
              Créer
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
          </div>
        </Card>
      )}

      {projects.length === 0 && !showCreate && !loadError && (
        <Card className="text-center py-14">
          <FolderKanban size={40} className="mx-auto text-ink3 mb-3" />
          <h2 className="text-base font-bold text-ink mb-1">Aucun projet</h2>
          <p className="text-sm text-ink3 mb-4">Créez votre premier projet pour commencer</p>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Créer un projet
          </Button>
        </Card>
      )}

      <div className="grid gap-4">
        {projects.map(project => (
          <Card
            key={project.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/dashboard/project-owner/projects/${project.id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-ink text-sm">{project.name}</h3>
                  {project.is_gbm_reviewed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-moss/10 text-moss font-bold">
                      GBM ✓
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-xs text-ink3 mt-1 line-clamp-1">{project.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <Progress value={progresses[project.id] || 0} />
                  <span className="text-xs font-bold text-moss flex-shrink-0">
                    {progresses[project.id] || 0}%
                  </span>
                </div>
              </div>
              <ArrowRight size={16} className="text-ink3 flex-shrink-0 mt-1" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
