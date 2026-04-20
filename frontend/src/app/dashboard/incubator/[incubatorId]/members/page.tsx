'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import {
  Badge, Button, Card, ErrorAlert, Field, Input, Select,
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
  admin: 'green',
  program_manager: 'blue',
  cohort_manager: 'amber',
  review_manager: 'blue',
  member: 'gray',
  viewer: 'gray',
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  program_manager: 'Program Mgr',
  cohort_manager: 'Cohort Mgr',
  review_manager: 'Review Mgr',
  member: 'Membre',
  viewer: 'Viewer',
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
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId.trim()) {
      setError('UUID utilisateur requis');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.post(`/incubators/${incubatorId}/members`, {
        userId: userId.trim(),
        role,
        job_title: jobTitle || undefined,
        can_manage_members: canManageMembers,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erreur lors de l'ajout");
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
          <div className="text-[15px] font-semibold">Inviter un membre</div>
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
            placeholder="ex: Responsable Cohortes"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
          />
        </Field>

        {/* Toggle manuel sans dépendance au composant Toggle */}
        <div className="flex items-center justify-between py-3 border-t border-border mt-2">
          <span className="text-[13px]">Peut gérer les membres</span>
          <button
            type="button"
            role="switch"
            aria-checked={canManageMembers}
            onClick={() => setCanManageMembers(v => !v)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200
              ${canManageMembers ? 'bg-accent' : 'bg-border'}`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200
                ${canManageMembers ? 'translate-x-[18px]' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <Button className="flex-1" onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            className="flex-1"
            loading={loading}
            onClick={handleSubmit}
          >
            Ajouter
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
  const [showModal, setShowModal] = useState(false);

  const fetchMembers = () => {
    if (!incubatorId) return;
    setLoading(true);
    api.get(`/incubators/${incubatorId}/members`)
      .then(res => setMembers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [incubatorId]);

  return (
    <div className="p-8 max-w-[760px]">
      {showModal && incubatorId && (
        <InviteModal
          incubatorId={incubatorId}
          onClose={() => setShowModal(false)}
          onSuccess={fetchMembers}
        />
      )}

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-[26px]">Équipe</h1>
        <Button
          variant="primary"
          className="text-[12px]"
          onClick={() => setShowModal(true)}
        >
          + Inviter un membre
        </Button>
      </div>
      <p className="text-[13px] text-text-2 mb-7">
        Gérez les membres et leurs permissions dans cet incubateur
      </p>

      <Card>
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          Membres ({members.length})
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-border rounded" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-[13px] text-text-2 text-center py-6">Aucun membre.</p>
        ) : (
          members.map(m => {
            const fn = m.user?.profile?.first_name ?? '?';
            const ln = m.user?.profile?.last_name ?? '';
            const initials = `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();

            return (
              <div
                key={m.id}
                className="flex items-center gap-3 py-3 border-b border-border last:border-none"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-accent-light text-accent flex items-center justify-center text-[12px] font-semibold flex-shrink-0">
                  {initials}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium flex items-center gap-2 flex-wrap">
                    {fn} {ln}
                    {m.is_primary_contact && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-light text-accent">
                        Contact principal
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-text-2 truncate">
                    {m.user?.email}
                    {m.job_title && ` · ${m.job_title}`}
                  </div>
                </div>

                {/* Permissions */}
                <div className="hidden md:flex gap-1 flex-wrap">
                  {m.can_manage_members && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-2">
                      Membres
                    </span>
                  )}
                  {m.can_manage_programs && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-2">
                      Programs
                    </span>
                  )}
                  {m.can_manage_cohorts && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-2">
                      Cohortes
                    </span>
                  )}
                </div>

                {/* Badges */}
                <Badge variant={ROLE_BADGE[m.role] ?? 'gray'}>
                  {ROLE_LABEL[m.role] ?? m.role}
                </Badge>
                <Badge variant={m.status === 'active' ? 'green' : 'gray'}>
                  {m.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}