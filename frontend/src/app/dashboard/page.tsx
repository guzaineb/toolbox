'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Badge, Button, Card, StatBox } from '@/components/shared/ui';

interface Incubator {
  id: string;
  name: string;
  city?: string;
  country?: string;
  description?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  members?: { id: string; role: string; status: string; user?: { profile?: { first_name: string; last_name: string } } }[];
  documents?: { id: string; verification_status: string; document_type: string }[];
}

const STATUS_BADGE: Record<string, 'amber' | 'green' | 'red'> = {
  pending: 'amber', approved: 'green', rejected: 'red',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté',
};
const ROLE_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'gray'> = {
  admin: 'green', program_manager: 'blue', cohort_manager: 'amber',
  review_manager: 'blue', member: 'gray', viewer: 'gray',
};
const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', program_manager: 'Program Mgr', cohort_manager: 'Cohort Mgr',
  review_manager: 'Review Mgr', member: 'Membre', viewer: 'Viewer',
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [loadingInc, setLoadingInc] = useState(true);
  const [selectedInc, setSelectedInc] = useState<Incubator | null>(null);

  useEffect(() => {
    api.get('/incubators/my')
      .then(res => {
        const data: Incubator[] = res.data ?? [];
        setIncubators(data);
        if (data.length > 0) setSelectedInc(data[0]);
      })
      .catch(() => setIncubators([]))
      .finally(() => setLoadingInc(false));
  }, [user]);

  if (authLoading || loadingInc) {
    return (
      <div className="p-8 max-w-[1100px] animate-pulse space-y-4">
        <div className="h-[100px] bg-border rounded" />
        <div className="grid grid-cols-4 gap-2.5">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-border rounded" />)}
        </div>
        <div className="grid grid-cols-[1fr_300px] gap-4">
          <div className="h-48 bg-border rounded" />
          <div className="h-48 bg-border rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 max-w-[480px]">
        <Card className="text-center py-14">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-[16px] font-semibold mb-2">Session expirée</h2>
          <p className="text-[13px] text-text-2 mb-5">Veuillez vous reconnecter.</p>
          <Link href="/auth/login"><Button variant="primary">Se connecter</Button></Link>
        </Card>
      </div>
    );
  }

  const firstName = user.profile?.first_name ?? '';
  const lastName  = user.profile?.last_name ?? '';
  const fullName  = [firstName, lastName].filter(Boolean).join(' ') || 'Utilisateur';
  const initials  = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '??';
  const location  = [user.profile?.city, user.profile?.country].filter(Boolean).join(', ');

  const bannerBadges: string[] = [];
  if ((user.incubatorMembers?.length ?? 0) > 0) bannerBadges.push('Admin incubateur');
  if (user.projectOwnerProfile) bannerBadges.push('Porteur de projet');
  if (user.expertProfile) bannerBadges.push('Expert');
  if (user.is_verified) bannerBadges.push('✓ Vérifié');

  const pendingDocs = selectedInc?.documents?.filter(d => d.verification_status === 'pending') ?? [];

  return (
    <div className="p-8 max-w-[1100px]">

      <div className="mb-5">
        <h1 className="font-display text-[22px]">Dashboard</h1>
        <p className="text-[13px] text-text-2">Bienvenue, {firstName || 'utilisateur'} — voici votre espace de travail</p>
      </div>

      {/* Banner */}
      <div className="bg-accent rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center text-[16px] font-semibold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-semibold text-white">{fullName}</div>
          <div className="text-[12px] text-white/75 mt-0.5">
            {user.email}{location ? ` · ${location}` : ''}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {bannerBadges.map(b => (
              <span key={b} className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full">{b}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/dashboard/profile/edit">
            <Button className="!bg-white/15 !text-white !border-white/20 text-[12px] hover:!bg-white/25">
              Modifier le profil
            </Button>
          </Link>
          <Link href="/dashboard/incubator/create">
            <Button className="!bg-white !text-accent !border-white text-[12px] font-medium">
              + Créer incubateur
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <StatBox num={user.is_verified ? '✓' : '✗'} label="Email vérifié" />
        <StatBox num={incubators.length} label="Incubateurs" />
        <StatBox num={user.expertProfile ? '✓' : '—'} label="Profil expert" />
        <StatBox num={user.projectOwnerProfile ? '✓' : '—'} label="Profil porteur" />
      </div>

      {/* Two-col */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        <div className="space-y-4">
          {/* Incubateurs */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2">Mes incubateurs</div>
              <Link href="/dashboard/incubator/create">
                <Button variant="primary" className="text-[11px] !py-1 !px-2.5">+ Nouveau</Button>
              </Link>
            </div>
            {incubators.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-3">🏢</div>
                <p className="text-[13px] font-medium mb-1">Aucun incubateur</p>
                <p className="text-[12px] text-text-2 mb-4">Créez votre premier incubateur pour commencer.</p>
                <Link href="/dashboard/incubator/create">
                  <Button variant="primary" className="text-[12px]">Créer un incubateur</Button>
                </Link>
              </div>
            ) : (
              incubators.map(inc => (
                <div
                  key={inc.id}
                  className={`flex items-center gap-3 py-3 border-b border-border last:border-none cursor-pointer rounded transition-colors ${selectedInc?.id === inc.id ? 'bg-accent-light' : 'hover:bg-bg'}`}
                  style={{ padding: '10px 8px' }}
                  onClick={() => setSelectedInc(inc)}
                >
                  <div className="w-9 h-9 rounded bg-accent-light text-accent-mid flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
                    {inc.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{inc.name}</div>
                    <div className="text-[11px] text-text-2">
                      {[inc.city, inc.country].filter(Boolean).join(', ')} · {inc.members?.length ?? 0} membres
                    </div>
                  </div>
                  <Badge variant={STATUS_BADGE[inc.verification_status] ?? 'gray'}>
                    {STATUS_LABEL[inc.verification_status] ?? inc.verification_status}
                  </Badge>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Link href={`/dashboard/incubator/${inc.id}/members`} onClick={e => e.stopPropagation()}>
                      <Button className="text-[11px] !py-1 !px-2">Équipe</Button>
                    </Link>
                    <Link href={`/dashboard/incubator/${inc.id}`} onClick={e => e.stopPropagation()}>
                      <Button className="text-[11px] !py-1 !px-2">Gérer →</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </Card>

          {/* Raccourcis */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '💡', title: 'Porteur de projet', desc: 'Profil entrepreneurial', href: '/dashboard/project-owner' },
              { icon: '📄', title: 'Documents', desc: 'Vérification incubateur', href: selectedInc ? `/dashboard/incubator/${selectedInc.id}/documents` : '/dashboard/incubator' },
              { icon: '👤', title: 'Mon profil', desc: 'Infos personnelles', href: '/dashboard/profile/edit' },
            ].map(({ icon, title, desc, href }) => (
              <Link key={title} href={href}>
                <Card className="hover:border-accent transition-colors cursor-pointer !p-4">
                  <div className="text-[16px] mb-2">{icon}</div>
                  <div className="text-[13px] font-medium">{title}</div>
                  <p className="text-[11px] text-text-2 mt-0.5">{desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          {/* Équipe */}
          {selectedInc ? (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 truncate">
                  Équipe — {selectedInc.name}
                </div>
                <Link href={`/dashboard/incubator/${selectedInc.id}/members`}>
                  <Button className="text-[11px] !py-1 !px-2">+ Inviter</Button>
                </Link>
              </div>
              {(selectedInc.members ?? []).length === 0 ? (
                <p className="text-[12px] text-text-2 text-center py-4">Aucun membre.</p>
              ) : (
                (selectedInc.members ?? []).slice(0, 5).map(m => {
                  const fn = m.user?.profile?.first_name ?? '?';
                  const ln = m.user?.profile?.last_name ?? '';
                  return (
                    <div key={m.id} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-none">
                      <div className="w-7 h-7 rounded-full bg-accent-light text-accent flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                        {`${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 text-[13px] truncate">{fn} {ln}</div>
                      <Badge variant={ROLE_BADGE[m.role] ?? 'gray'}>{ROLE_LABEL[m.role] ?? m.role}</Badge>
                    </div>
                  );
                })
              )}
            </Card>
          ) : (
            <Card className="text-center py-10">
              <p className="text-[12px] text-text-2">Sélectionnez un incubateur pour voir son équipe.</p>
            </Card>
          )}

          {/* Documents en attente */}
          <Card>
            <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
              Documents en attente
            </div>
            {pendingDocs.length === 0 ? (
              <p className="text-[12px] text-text-2 text-center py-4">Aucun document en attente.</p>
            ) : (
              pendingDocs.map(doc => (
                <div key={doc.id} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-none">
                  <span className="text-[14px]">📄</span>
                  <span className="text-[13px] flex-1 truncate capitalize">
                    {doc.document_type.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="amber">En attente</Badge>
                </div>
              ))
            )}
            {selectedInc && (
              <Link href={`/dashboard/incubator/${selectedInc.id}/documents`}>
                <Button className="w-full justify-center text-[12px] mt-3">
                  Uploader des documents
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}