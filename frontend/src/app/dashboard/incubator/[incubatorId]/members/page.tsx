'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import {
  AdminGuard, Badge, Button, Card, ErrorAlert, Field, Input, Select, StatBox, Textarea, Toggle,
} from '@/components/shared/ui';

interface Member {
  id: string;
  role: string;
  job_title?: string;
  status: string;
  is_primary_contact: boolean;
  can_manage_programs: boolean;
  can_manage_cohorts: boolean;
  can_manage_members: boolean;
  user?: {
    id: string;
    email: string;
    profile?: { first_name: string; last_name: string };
  };
}

const ROLE_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'gray'> = {
  admin: 'green', program_manager: 'blue', cohort_manager: 'amber',
  review_manager: 'blue', member: 'gray', viewer: 'gray',
};
const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', program_manager: 'Program Mgr', cohort_manager: 'Cohort Mgr',
  review_manager: 'Review Mgr', member: 'Membre', viewer: 'Viewer',
};

function InviteModal({
  incubatorId,
  onClose,
  onSuccess,
}: {
  incubatorId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const [jobTitle, setJobTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId.trim()) { setError('UUID utilisateur requis'); return; }
    setError(null);
    setLoading(true);
    try {
      await api.post(`/incubators/${incubatorId}/members`, {
        userId: userId.trim(),
        role,
        job_title: jobTitle,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface rounded-[12px] p-7 w-full max-w-[420px] shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[15px] font-semibold">
            Inviter un membre <AdminGuard />
          </div>
          <Button className="!py-1 !px-2 text-[12px]" onClick={onClose}>✕</Button>
        </div>
        {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
        <Field label="UUID de l'utilisateur">
          <Input
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={userId}
            onChange={e => setUserId(e.target.value)}
          />
        </Field>
        <Field label="Rôle">
          <Select value={role} onChange={e => setRole(e.target.value)}>
            <option value="program_manager">Program Manager</option>
            <option value="cohort_manager">Cohort Manager</option>
            <option value="review_manager">Review Manager</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </Select>
        </Field>
        <Field label="Titre du poste">
          <Input
            placeholder="ex: Responsable Cohorte 2025"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
          />
        </Field>
        <div className="flex gap-2 mt-1">
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" className="flex-1 justify-center" onClick={handleSubmit} loading={loading}>
            Ajouter le membre
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [perms, setPerms] = useState({ programs: false, cohorts: false, members: false });

  const fetchMembers = () => {
    if (!incubatorId) return;
    api.get(`/incubators/${incubatorId}/members`)
      .then(res => setMembers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, [incubatorId]);

  useEffect(() => {
    if (selectedMember) {
      setPerms({
        programs: selectedMember.can_manage_programs,
        cohorts: selectedMember.can_manage_cohorts,
        members: selectedMember.can_manage_members,
      });
    }
  }, [selectedMember]);

  const activeMembersCount = members.filter(m => m.status === 'active').length;
  const adminCount = members.filter(m => m.role === 'admin').length;

  if (loading) {
    return <div className="p-8"><div className="animate-pulse h-7 w-48 bg-border rounded" /></div>;
  }

  return (
    <div className="p-8 max-w-[800px]">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-[26px]">Équipe incubateur</h1>
        <Button variant="primary" className="text-[12px]" onClick={() => setShowInvite(true)}>
          + Inviter <AdminGuard className="!text-white !bg-white/25 !border-transparent" />
        </Button>
      </div>
      <p className="text-[13px] text-text-2 mb-7">{members.length} membre{members.length !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <StatBox num={activeMembersCount} label="Membres actifs" />
        <StatBox num={adminCount} label="Admin(s)" />
        <StatBox num={new Set(members.map(m => m.role)).size} label="Rôles distincts" />
      </div>

      <Card className="mb-4">
        {members.length === 0 ? (
          <p className="text-[13px] text-text-2 text-center py-6">Aucun membre pour l'instant.</p>
        ) : (
          members.map(m => {
            const fn = m.user?.profile?.first_name ?? m.user?.email?.split('@')[0] ?? '?';
            const ln = m.user?.profile?.last_name ?? '';
            const initials = `${fn.charAt(0)}${ln.charAt(0) || ''}`.toUpperCase();
            return (
              <div key={m.id} className="flex items-center gap-3 py-3 border-b border-border last:border-none">
                <div className="w-[30px] h-[30px] rounded-full bg-accent-light text-accent flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">
                    {fn} {ln}
                    {m.is_primary_contact && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-light text-accent ml-1">Contact principal</span>
                    )}
                  </div>
                  <div className="text-[12px] text-text-2">{m.job_title ?? '—'}</div>
                </div>
                <Badge variant={ROLE_BADGE[m.role] ?? 'gray'}>{ROLE_LABEL[m.role] ?? m.role}</Badge>
                <Badge variant={m.status === 'active' ? 'green' : 'amber'} className="ml-1.5">
                  {m.status === 'active' ? 'Actif' : 'En attente'}
                </Badge>
                <Button
                  className="text-[11px] !py-1 !px-2 ml-2"
                  onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                >
                  {selectedMember?.id === m.id ? '▲' : '···'}
                </Button>
              </div>
            );
          })
        )}
      </Card>

      {/* Permissions panel */}
      {selectedMember && (
        <Card className="bg-bg">
          <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
            Permissions — {selectedMember.user?.profile?.first_name} ({ROLE_LABEL[selectedMember.role] ?? selectedMember.role})
          </div>
          {[
            { key: 'programs' as const, label: 'Gérer les programmes' },
            { key: 'cohorts' as const, label: 'Gérer les cohortes' },
            { key: 'members' as const, label: 'Gérer les membres' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-none text-[13px]">
              <span>{label}</span>
              <Toggle
                on={perms[key]}
                onToggle={() => setPerms(p => ({ ...p, [key]: !p[key] }))}
              />
            </div>
          ))}
          <Button variant="primary" className="text-[12px] mt-3">Enregistrer les permissions</Button>
        </Card>
      )}

      {showInvite && (
        <InviteModal
          incubatorId={incubatorId}
          onClose={() => setShowInvite(false)}
          onSuccess={fetchMembers}
        />
      )}
    </div>
  );
}
