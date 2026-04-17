'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Badge, Button, Card, StatBox } from '@/components/shared/ui';

interface Member {
  id: string;
  role: string;
  job_title?: string;
  status: string;
  is_primary_contact: boolean;
  user?: { profile?: { first_name: string; last_name: string } };
}

interface Incubator {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  city?: string;
  country?: string;
  verification_status: string;
  status: string;
  members?: Member[];
}

const ROLE_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'gray'> = {
  admin: 'green', program_manager: 'blue', cohort_manager: 'amber',
  review_manager: 'blue', member: 'gray', viewer: 'gray',
};
const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', program_manager: 'Program Mgr', cohort_manager: 'Cohort Mgr',
  review_manager: 'Review Mgr', member: 'Membre', viewer: 'Viewer',
};

export default function IncubatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [incubator, setIncubator] = useState<Incubator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/incubators/${id}`)
        .then(res => setIncubator(res.data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-64 bg-border rounded" />
          <div className="h-4 w-48 bg-border rounded" />
        </div>
      </div>
    );
  }

  if (!incubator) {
    return (
      <div className="p-8">
        <Card className="text-center py-12">
          <p className="text-text-2">Incubateur introuvable.</p>
          <Link href="/dashboard/incubator">
            <Button className="mt-4">← Retour</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const activeMembers = incubator.members?.filter(m => m.status === 'active') ?? [];

  return (
    <div className="p-8 max-w-[860px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-display text-[26px]">{incubator.name}</h1>
            <Badge variant={incubator.verification_status === 'approved' ? 'green' : incubator.verification_status === 'rejected' ? 'red' : 'amber'}>
              {incubator.verification_status === 'approved' ? 'Approuvé' : incubator.verification_status === 'rejected' ? 'Rejeté' : 'En attente'}
            </Badge>
          </div>
          {incubator.description && (
            <p className="text-[13px] text-text-2 max-w-xl">{incubator.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/incubator/${id}/members`}>
            <Button className="text-[12px]">Équipe</Button>
          </Link>
          <Link href={`/dashboard/incubator/${id}/documents`}>
            <Button className="text-[12px]">Documents</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <StatBox num={incubator.members?.length ?? 0} label="Membres" />
        <StatBox num={activeMembers.length} label="Actifs" />
        <StatBox
          num={incubator.verification_status === 'approved' ? '✓' : '⏳'}
          label="Vérification"
        />
      </div>

      {/* Info card */}
      <Card className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          Informations
        </div>
        <div className="grid grid-cols-2 gap-y-3 text-[13px]">
          {incubator.email && (
            <><span className="text-text-2">Email</span><span>{incubator.email}</span></>
          )}
          {incubator.phone && (
            <><span className="text-text-2">Téléphone</span><span>{incubator.phone}</span></>
          )}
          {incubator.website_url && (
            <><span className="text-text-2">Site web</span>
            <a href={incubator.website_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              {incubator.website_url}
            </a></>
          )}
          {(incubator.city || incubator.country) && (
            <><span className="text-text-2">Localisation</span>
            <span>{[incubator.city, incubator.country].filter(Boolean).join(', ')}</span></>
          )}
        </div>
      </Card>

      {/* Members preview */}
      {incubator.members && incubator.members.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2">
              Équipe ({incubator.members.length})
            </div>
            <Link href={`/dashboard/incubator/${id}/members`}>
              <Button className="text-[11px] !py-1 !px-2">Gérer →</Button>
            </Link>
          </div>
          {incubator.members.slice(0, 4).map(m => {
            const fn = m.user?.profile?.first_name ?? '?';
            const ln = m.user?.profile?.last_name ?? '';
            const initials = `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
            return (
              <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-none">
                <div className="w-[28px] h-[28px] rounded-full bg-accent-light text-accent flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                  {initials}
                </div>
                <span className="text-[13px] flex-1">{fn} {ln}</span>
                {m.is_primary_contact && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-light text-accent">Contact principal</span>
                )}
                <Badge variant={ROLE_BADGE[m.role] ?? 'gray'}>{ROLE_LABEL[m.role] ?? m.role}</Badge>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
