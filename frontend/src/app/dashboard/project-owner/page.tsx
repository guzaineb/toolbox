'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Briefcase, Zap, GraduationCap, Link2, Pencil, Plus,
  Trash2, X, Loader2, Rocket, BookOpen, Building2, Calendar,
  CheckCircle2, TrendingUp, LayoutTemplate,
} from 'lucide-react'
import { useProjectOwnerProfile } from '@/hooks/useProjectOwnerProfile'
import {
  Button, Card, CardHeader, Badge, ProgressBar, ErrorAlert,
} from '@/components/shared/ui'
import { SkillModal } from '@/components/project-owner/SkillModal'
import { ExperienceModal } from '@/components/project-owner/ExperienceModal'

const STATUS_LABEL: Record<string, string> = {
  student: 'Étudiant',
  employee: 'Salarié',
  entrepreneur: 'Entrepreneur',
  unemployed: 'Sans emploi',
}

const EDU_LABEL: Record<string, string> = {
  bac: 'Bac',
  'bac+2': 'Bac+2',
  'bac+3': 'Bac+3 (Licence)',
  'bac+5': 'Bac+5 (Master)',
  doctorat: 'Doctorat',
}

const EXP_LEVEL_LABEL: Record<
  number,
  { label: string; variant: 'green' | 'blue' | 'amber' | 'gray' }
> = {
  0: { label: 'Débutant', variant: 'gray' },
  1: { label: 'Idée en développement', variant: 'green' },
  2: { label: 'Intermédiaire', variant: 'blue' },
  3: { label: 'Avancé', variant: 'amber' },
}

const SKILL_LEVEL_LABEL: Record<
  string,
  { label: string; variant: 'green' | 'blue' | 'amber' | 'gray' }
> = {
  beginner: { label: 'Débutant', variant: 'gray' },
  intermediate: { label: 'Intermédiaire', variant: 'blue' },
  advanced: { label: 'Avancé', variant: 'amber' },
  expert: { label: 'Expert', variant: 'green' },
}

export default function ProjectOwnerDashboard() {
  const router = useRouter()
  const {
    profile,
    loading,
    saving,
    error,
    addSkill,
    addExperience,
    deleteSkill,
    deleteExperience,
    refetch,
  } = useProjectOwnerProfile()

  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showExpModal, setShowExpModal] = useState(false)

  const getCompletionPercentage = () => {
    if (!profile) return 0
    let completed = 0
    let total = 7

    if (profile.current_status) completed++
    if (profile.education_level) completed++
    if (profile.field_of_study) completed++
    if (profile.occupation) completed++
    if (profile.entrepreneurial_experience_level > 0) completed++
    if (profile.has_previous_startup) completed++
    if (profile.linkedin_url) completed++

    if (profile.skills?.length > 0) completed += Math.min(profile.skills.length, 2)
    if (profile.experiences?.length > 0) completed += Math.min(profile.experiences.length, 2)

    total += 4
    return Math.min(Math.floor((completed / total) * 100), 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2eb]">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-moss animate-spin mb-3" />
          <p className="text-[13px] text-ink3">Chargement de votre profil…</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 md:p-8 max-w-[500px] mx-auto">
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <User size={24} />
          </div>
          <h2 className="font-syne text-[18px] font-bold text-ink mb-2">Aucun profil trouvé</h2>
          <p className="text-[13px] text-ink3 mb-6">
            Vous n'avez pas encore créé votre profil porteur de projet.
          </p>
          <Button variant="primary" onClick={() => router.push('/dashboard/project-owner/create')}>
            <Plus size={14} /> Créer mon profil
          </Button>
        </Card>
      </div>
    )
  }

  const completion = getCompletionPercentage()
  const expLevel = profile.entrepreneurial_experience_level ?? 0
  const expConfig = EXP_LEVEL_LABEL[expLevel] || EXP_LEVEL_LABEL[0]

  return (
    <div className="p-6 md:p-8 max-w-[900px] mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-2">
            Mon profil porteur de projet
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={expConfig.variant}>{expConfig.label}</Badge>
            {profile.has_previous_startup && <Badge variant="green">Startup expérimenté</Badge>}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/project-owner/edit')}>
            <Pencil size={13} /> Modifier
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* ── Progression ── */}
      <Card className="p-0 overflow-hidden">
        <div className="p-[14px_18px] flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <TrendingUp size={14} className="text-moss" />
            <span className="text-[11px] font-bold text-ink3 uppercase tracking-[0.07em]">
              Complétion du profil
            </span>
          </div>
          <div className="flex-1 w-full">
            <ProgressBar value={completion} />
          </div>
          <span className="text-[13px] font-bold text-moss flex-shrink-0">{completion}%</span>
        </div>
      </Card>

      {/* ── Stats rapides ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px] text-center">
          <div className="font-syne text-[22px] font-extrabold text-ink leading-none">
            {profile.skills?.length ?? 0}
          </div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">
            Compétences
          </div>
        </div>
        <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px] text-center">
          <div className="font-syne text-[22px] font-extrabold text-ink leading-none">
            {profile.experiences?.length ?? 0}
          </div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">
            Expériences
          </div>
        </div>
        <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px] text-center">
          <div className="font-syne text-[22px] font-extrabold text-ink leading-none">
            {expLevel}
          </div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">
            Niveau
          </div>
        </div>
        <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px] text-center">
          <div className="font-syne text-[22px] font-extrabold text-ink leading-none">
            {profile.has_previous_startup ? 'Oui' : 'Non'}
          </div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">
            Startup
          </div>
        </div>
      </div>

      {/* ── Grille infos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Informations personnelles */}
        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<User size={13} />} title="Informations personnelles" />
          <div className="px-[18px] py-2 divide-y divide-border">
            <div className="flex items-start gap-[9px] py-[9px]">
              <div className="w-[20px] flex-shrink-0 mt-[1px] text-ink3">
                <Briefcase size={13} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.07em] mb-[2px]">
                  Statut
                </div>
                <div className="text-[13px] font-medium text-ink">
                  {profile.current_status ? STATUS_LABEL[profile.current_status] : 'Non renseigné'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-[9px] py-[9px]">
              <div className="w-[20px] flex-shrink-0 mt-[1px] text-ink3">
                <GraduationCap size={13} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.07em] mb-[2px]">
                  Niveau d'études
                </div>
                <div className="text-[13px] font-medium text-ink">
                  {profile.education_level ? EDU_LABEL[profile.education_level] : 'Non renseigné'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-[9px] py-[9px]">
              <div className="w-[20px] flex-shrink-0 mt-[1px] text-ink3">
                <BookOpen size={13} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.07em] mb-[2px]">
                  Domaine
                </div>
                <div className="text-[13px] font-medium text-ink">
                  {profile.field_of_study || 'Non renseigné'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-[9px] py-[9px]">
              <div className="w-[20px] flex-shrink-0 mt-[1px] text-ink3">
                <LayoutTemplate size={13} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.07em] mb-[2px]">
                  Occupation
                </div>
                <div className="text-[13px] font-medium text-ink">
                  {profile.occupation || 'Non renseigné'}
                </div>
              </div>
            </div>
            {profile.linkedin_url && (
              <div className="flex items-start gap-[9px] py-[9px]">
                <div className="w-[20px] flex-shrink-0 mt-[1px] text-ink3">
                  <Link2 size={13} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.07em] mb-[2px]">
                    LinkedIn
                  </div>
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-moss hover:underline"
                  >
                    Voir le profil →
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Parcours entrepreneurial */}
        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<Rocket size={13} />} title="Parcours entrepreneurial" />
          <div className="px-[18px] py-2 divide-y divide-border">
            <div className="flex items-start gap-[9px] py-[9px]">
              <div className="w-[20px] flex-shrink-0 mt-[1px] text-ink3">
                <TrendingUp size={13} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.07em] mb-[2px]">
                  Expérience
                </div>
                <div className="text-[13px] font-medium text-ink flex items-center gap-2">
                  {expConfig.label}
                  <Badge variant={expConfig.variant} className="text-[9px]">
                    {expConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-[9px] py-[9px]">
              <div className="w-[20px] flex-shrink-0 mt-[1px] text-ink3">
                <Building2 size={13} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.07em] mb-[2px]">
                  Startup précédente
                </div>
                <div className="text-[13px] font-medium text-ink">
                  {profile.has_previous_startup ? (
                    <span className="flex items-center gap-1 text-moss">
                      <CheckCircle2 size={13} /> Oui
                    </span>
                  ) : (
                    <span className="text-ink3">Non</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Compétences & Expériences ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compétences */}
        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<Zap size={13} />} title="Compétences">
            <Button size="sm" variant="ghost" onClick={() => setShowSkillModal(true)}>
              <Plus size={13} /> Ajouter
            </Button>
          </CardHeader>
          <div className="p-[16px_18px]">
            {!profile.skills?.length ? (
              <div className="text-center py-8">
                <Zap size={28} className="mx-auto text-ink3 mb-2" />
                <p className="text-[12px] text-ink3">Aucune compétence renseignée</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {profile.skills.map((skill) => {
                  const levelConfig = SKILL_LEVEL_LABEL[skill.level] || SKILL_LEVEL_LABEL.beginner
                  return (
                    <div key={skill.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-ink">{skill.skill_name}</span>
                          <Badge variant={levelConfig.variant} className="text-[9px]">
                            {levelConfig.label}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="!text-red hover:!bg-red-light flex-shrink-0"
                          onClick={() => deleteSkill(skill.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Expériences */}
        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<Briefcase size={13} />} title="Expériences">
            <Button size="sm" variant="ghost" onClick={() => setShowExpModal(true)}>
              <Plus size={13} /> Ajouter
            </Button>
          </CardHeader>
          <div className="p-[16px_18px]">
            {!profile.experiences?.length ? (
              <div className="text-center py-8">
                <Briefcase size={28} className="mx-auto text-ink3 mb-2" />
                <p className="text-[12px] text-ink3">Aucune expérience renseignée</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {profile.experiences.map((exp) => (
                  <div key={exp.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-ink">{exp.title}</div>
                        <div className="text-[11px] text-ink3 mt-0.5">{exp.organization}</div>
                        {(exp.start_date || exp.end_date) && (
                          <div className="flex items-center gap-1 text-[10px] text-ink3 mt-1">
                            <Calendar size={10} />
                            {exp.start_date
                              ? new Date(exp.start_date).toLocaleDateString('fr-FR')
                              : '—'}
                            {' → '}
                            {exp.end_date
                              ? new Date(exp.end_date).toLocaleDateString('fr-FR')
                              : 'Présent'}
                          </div>
                        )}
                        {exp.description && (
                          <p className="text-[12px] text-ink2 mt-2 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!text-red hover:!bg-red-light flex-shrink-0"
                        onClick={() => deleteExperience(exp.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Modales ── */}
      {showSkillModal && (
        <SkillModal
          onAdd={async (skill) => {
            await addSkill(skill)
            setShowSkillModal(false)
            await refetch()
          }}
          onClose={() => setShowSkillModal(false)}
          saving={saving}
        />
      )}
      {showExpModal && (
        <ExperienceModal
          onAdd={async (exp) => {
            await addExperience(exp)
            setShowExpModal(false)
            await refetch()
          }}
          onClose={() => setShowExpModal(false)}
          saving={saving}
        />
      )}
    </div>
  )
}