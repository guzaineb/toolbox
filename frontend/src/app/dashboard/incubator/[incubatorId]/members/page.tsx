'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Users, Mail, X, UserPlus, Pencil, Trash2, Shield, Send,
} from 'lucide-react'
import api from '@/services/api'
import {
  Badge, Button, Card, CardHeader, ErrorAlert, SuccessAlert,
  Field, Input, Select, Toggle, Avatar, Sep, SectionLabel,
} from '@/components/shared/ui'

interface Member {
  id: string
  role: string
  job_title?: string
  status: string
  is_primary_contact: boolean
  can_manage_programs: boolean
  can_manage_cohorts: boolean
  can_manage_members: boolean
  user?: {
    id: string
    email: string
    profile?: { first_name: string; last_name: string }
  }
}

const ROLE_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'gray'> = {
  admin: 'green', program_manager: 'blue', cohort_manager: 'amber',
  review_manager: 'blue', member: 'gray', viewer: 'gray',
}
const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', program_manager: 'Program Mgr', cohort_manager: 'Cohort Mgr',
  review_manager: 'Review Mgr', member: 'Membre', viewer: 'Viewer',
}

const AVATAR_COLORS = [
  'bg-[rgba(127,119,221,0.12)] text-[#6b63d0]',
  'bg-[rgba(45,138,221,0.12)] text-[#2572b8]',
  'bg-[rgba(212,83,126,0.12)] text-[#b84070]',
  'bg-[rgba(201,168,76,0.12)] text-[#8a6a10]',
  'bg-[rgba(29,158,117,0.12)] text-[#1a8060]',
  'bg-[rgba(99,102,241,0.12)] text-[#4f46e5]',
]

/* ═════════════════════════════════════
   MODALE : INVITER UN MEMBRE
═════════════════════════════════════ */
function InviteModal({
  incubatorId, onClose, onSuccess,
}: {
  incubatorId: string
  onClose: () => void
  onSuccess: (email: string) => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [jobTitle, setJobTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Email requis'); return }
    setError(null)
    setLoading(true)
    try {
      await api.post(`/incubators/${incubatorId}/members/invite`, {
        email: email.trim(),
        role,
        job_title: jobTitle || undefined,
      })
      setSent(true)
      onSuccess(email.trim())
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erreur lors de l'invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-[420px] p-0 overflow-hidden shadow-lg">
        <CardHeader icon={<UserPlus size={13} />} title="Inviter un membre">
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X size={14} />
          </Button>
        </CardHeader>

        <div className="p-[18px]">
          {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

          {sent ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-3">
                <Send size={20} />
              </div>
              <h3 className="font-syne text-[15px] font-bold text-ink mb-1">Invitation envoyée</h3>
              <p className="text-[12px] text-ink3 mb-4">
                Une notification a été transmise par email. Le membre recevra un lien pour rejoindre l'incubateur.
              </p>
              <Button variant="primary" className="w-full" onClick={onClose}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Field label="Email de l'utilisateur">
                <Input
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </Field>
              <Field label="Rôle">
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="program_manager">Program Manager</option>
                  <option value="cohort_manager">Cohort Manager</option>
                  <option value="review_manager">Review Manager</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </Select>
              </Field>
              <Field label="Titre du poste">
                <Input
                  placeholder="ex: Responsable Cohortes"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </Field>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={onClose}>Annuler</Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  loading={loading}
                  onClick={handleSubmit}
                >
                  Envoyer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ═════════════════════════════════════
   MODALE : ÉDITER UN MEMBRE
═════════════════════════════════════ */
function EditMemberModal({
  incubatorId, member, onClose, onSuccess,
}: {
  incubatorId: string
  member: Member
  onClose: () => void
  onSuccess: () => void
}) {
  const [role, setRole] = useState(member.role)
  const [jobTitle, setJobTitle] = useState(member.job_title || '')
  const [canManageMembers, setCanManageMembers] = useState(member.can_manage_members)
  const [canManagePrograms, setCanManagePrograms] = useState(member.can_manage_programs)
  const [canManageCohorts, setCanManageCohorts] = useState(member.can_manage_cohorts)
  const [status, setStatus] = useState(member.status)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setError(null)
    setLoading(true)
    try {
      await api.patch(`/incubators/${incubatorId}/members/${member.id}`, {
        role,
        job_title: jobTitle || undefined,
        can_manage_members: canManageMembers,
        can_manage_programs: canManagePrograms,
        can_manage_cohorts: canManageCohorts,
        status,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const fn = member.user?.profile?.first_name ?? '?'
  const ln = member.user?.profile?.last_name ?? ''

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-[440px] p-0 overflow-hidden shadow-lg">
        <CardHeader icon={<Pencil size={13} />} title={`Modifier ${fn} ${ln}`}>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X size={14} />
          </Button>
        </CardHeader>

        <div className="p-[18px]">
          {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

          <div className="space-y-3">
            <Field label="Rôle">
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="program_manager">Program Manager</option>
                <option value="cohort_manager">Cohort Manager</option>
                <option value="review_manager">Review Manager</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </Select>
            </Field>
            <Field label="Titre du poste">
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </Field>
            <Field label="Statut">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </Select>
            </Field>

            <Sep />

            <SectionLabel>Permissions</SectionLabel>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-ink2">Gérer les membres</span>
                <Toggle on={canManageMembers} onToggle={() => setCanManageMembers(!canManageMembers)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-ink2">Gérer les programmes</span>
                <Toggle on={canManagePrograms} onToggle={() => setCanManagePrograms(!canManagePrograms)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-ink2">Gérer les cohortes</span>
                <Toggle on={canManageCohorts} onToggle={() => setCanManageCohorts(!canManageCohorts)} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═════════════════════════════════════
   PAGE PRINCIPALE
═════════════════════════════════════ */
export default function MembersPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  const fetchMembers = () => {
    if (!incubatorId) return
    setLoading(true)
    api.get(`/incubators/${incubatorId}/members`)
      .then((res) => setMembers(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMembers() }, [incubatorId])

  const handleDelete = async (memberId: string) => {
    setError(null)
    setDeletingId(memberId)
    try {
      await api.delete(`/incubators/${incubatorId}/members/${memberId}`)
      fetchMembers()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const handleInviteSuccess = (email: string) => {
    setShowInvite(false)
    fetchMembers()
    setInviteSuccess(`Invitation envoyée à ${email}. Une notification email a été transmise au destinataire.`)
    setTimeout(() => setInviteSuccess(null), 6000)
  }

  return (
    <div className="p-6 md:p-8 max-w-[760px] mx-auto">
      {showInvite && incubatorId && (
        <InviteModal
          incubatorId={incubatorId}
          onClose={() => setShowInvite(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
      {editingMember && incubatorId && (
        <EditMemberModal
          incubatorId={incubatorId}
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSuccess={fetchMembers}
        />
      )}

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-syne text-[22px] font-extrabold text-ink">Équipe</h1>
        <Button variant="primary" size="sm" onClick={() => setShowInvite(true)}>
          <UserPlus size={14} />
          Inviter un membre
        </Button>
      </div>
      <p className="text-[13px] text-ink3 mb-7">
        Gérez les membres et leurs permissions dans cet incubateur
      </p>

      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
      {inviteSuccess && (
        <div className="mb-4">
          <SuccessAlert message={inviteSuccess} />
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <CardHeader icon={<Users size={13} />} title={`Membres (${members.length})`} />
        <div className="p-[16px_18px]">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-border rounded-lg" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10">
              <Users size={32} className="mx-auto text-ink3 mb-3" />
              <p className="text-[13px] text-ink3">Aucun membre pour le moment.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setShowInvite(true)}
              >
                Inviter le premier membre
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members.map((m, idx) => {
                const fn = m.user?.profile?.first_name ?? '?'
                const ln = m.user?.profile?.last_name ?? ''
                const initials = `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase()
                const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]

                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${colorClass}`}
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-ink flex items-center gap-2 flex-wrap">
                        {fn} {ln}
                        {m.is_primary_contact && (
                          <span className="text-[9px] px-[6px] py-[2px] rounded-full bg-blue-light text-blue border border-blue/18 font-bold">
                            Contact principal
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink3 truncate">
                        {m.user?.email}
                        {m.job_title && ` · ${m.job_title}`}
                      </div>
                    </div>

                    <div className="hidden md:flex gap-1 flex-wrap">
                      {m.can_manage_members && (
                        <Badge variant="gray" className="text-[9px]">Membres</Badge>
                      )}
                      {m.can_manage_programs && (
                        <Badge variant="gray" className="text-[9px]">Programs</Badge>
                      )}
                      {m.can_manage_cohorts && (
                        <Badge variant="gray" className="text-[9px]">Cohortes</Badge>
                      )}
                    </div>

                    <Badge variant={ROLE_BADGE[m.role] ?? 'gray'}>
                      {ROLE_LABEL[m.role] ?? m.role}
                    </Badge>
                    <Badge variant={m.status === 'active' ? 'green' : 'gray'}>
                      {m.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>

                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingMember(m)}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!text-red hover:!bg-red-light"
                        loading={deletingId === m.id}
                        onClick={() => handleDelete(m.id)}
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
    </div>
  )
}