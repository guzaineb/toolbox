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
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  city?: string;
  country?: string;
  organization_type?: string;
  registration_number?: string;
  tax_id?: string;
  foundation_date?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'suspended';
  members?: Member[];
  documents?: { id: string; verification_status: string }[];
}

const ROLE_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'gray'> = {
  admin: 'green', program_manager: 'blue', cohort_manager: 'amber',
  review_manager: 'blue', member: 'gray', viewer: 'gray',
};
const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', program_manager: 'Program Mgr', cohort_manager: 'Cohort Mgr',
  review_manager: 'Review Mgr', member: 'Membre', viewer: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  program_manager: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  cohort_manager: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  review_manager: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  member: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
  viewer: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
};

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-indigo-100 text-indigo-700',
];

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-slate-100 last:border-none">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-[13px] text-indigo-600 hover:text-indigo-800 hover:underline truncate transition-colors">
          {value}
        </a>
      ) : (
        <span className="text-[13px] text-slate-700 font-medium">{value}</span>
      )}
    </div>
  );
}

export default function IncubatorDetailPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>();
  const [incubator, setIncubator] = useState<Incubator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (incubatorId) {
      api.get(`/incubators/${incubatorId}`)
        .then(res => setIncubator(res.data))
        .finally(() => setLoading(false));
    }
  }, [incubatorId]);

  if (loading) {
    return (
      <div className="p-8 max-w-[900px]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-72 bg-slate-100 rounded-lg" />
          <div className="h-4 w-48 bg-slate-100 rounded" />
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!incubator) {
    return (
      <div className="p-8">
        <Card className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">Incubateur introuvable.</p>
          <Link href="/dashboard/incubator">
            <Button className="mt-4">← Retour</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const activeMembers = incubator.members?.filter(m => m.status === 'active') ?? [];
  const approvedDocs = incubator.documents?.filter(d => d.verification_status === 'approved').length ?? 0;
  const totalDocs = incubator.documents?.length ?? 0;

  const verifConfig = {
    approved: { label: 'Approuvé', dot: 'bg-emerald-400', pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    rejected: { label: 'Rejeté', dot: 'bg-red-400', pill: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
    pending: { label: 'En attente', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  }[incubator.verification_status];

  const statusConfig = incubator.status === 'active'
    ? { label: 'Actif', dot: 'bg-blue-400', pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' }
    : { label: 'Suspendu', dot: 'bg-slate-300', pill: 'bg-slate-50 text-slate-500 ring-1 ring-slate-200' };

  const infoFields = [
    incubator.slug && { label: 'Slug', value: incubator.slug },
    incubator.organization_type && { label: 'Type', value: incubator.organization_type },
    incubator.email && { label: 'Email', value: incubator.email },
    incubator.phone && { label: 'Téléphone', value: incubator.phone },
    incubator.website_url && { label: 'Site web', value: incubator.website_url, href: incubator.website_url },
    (incubator.city || incubator.country) && { label: 'Localisation', value: [incubator.city, incubator.country].filter(Boolean).join(', ') },
    incubator.registration_number && { label: "N° d'enregistrement", value: incubator.registration_number },
    incubator.tax_id && { label: 'NIF', value: incubator.tax_id },
    incubator.foundation_date && { label: 'Fondation', value: String(new Date(incubator.foundation_date).getFullYear()) },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  const docsProgress = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

  return (
    <div className="p-8 max-w-[900px] space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-3 text-[11px] text-slate-400">
            <Link href="/dashboard/incubator" className="hover:text-slate-600 transition-colors">Incubateurs</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-slate-600 font-medium truncate">{incubator.name}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <h1 className="font-semibold text-[22px] text-slate-900 leading-tight">{incubator.name}</h1>
            {/* Verification pill */}
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${verifConfig.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${verifConfig.dot}`} />
              {verifConfig.label}
            </span>
            {/* Status pill */}
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${statusConfig.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>

          {incubator.description && (
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-xl">{incubator.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/dashboard/incubator/${incubatorId}/members`}>
            <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Équipe
            </button>
          </Link>
          <Link href={`/dashboard/incubator/${incubatorId}/documents`}>
            <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Documents
            </button>
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Membres */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{incubator.members?.length ?? 0}</div>
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Membres</div>
        </div>
        {/* Docs with progress bar */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="flex items-end justify-between mb-2">
            <div className="text-[26px] font-bold text-slate-900 leading-none">{approvedDocs}<span className="text-[16px] text-slate-400 font-normal">/{totalDocs}</span></div>
            <span className="text-[11px] text-slate-400 font-medium mb-0.5">{docsProgress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${docsProgress}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1.5">Docs validés</div>
        </div>
        {/* Membres actifs */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{activeMembers.length}</div>
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Membres actifs</div>
        </div>
      </div>

      {/* ── Two-column layout: Info + Members ── */}
      <div className="grid grid-cols-[1fr_1.1fr] gap-4 items-start">

        {/* Informations */}
        {infoFields.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Informations</span>
            </div>
            <div className="px-5 divide-y divide-slate-100">
              {infoFields.map((f) => (
                <InfoRow key={f.label} label={f.label} value={f.value} href={f.href} />
              ))}
            </div>
          </div>
        )}

        {/* Team preview */}
        {incubator.members && incubator.members.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Équipe <span className="text-slate-300 font-normal">({incubator.members.length})</span>
                </span>
              </div>
              <Link href={`/dashboard/incubator/${incubatorId}/members`}>
                <button className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1">
                  Gérer
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {incubator.members.slice(0, 5).map((m, idx) => {
                const fn = m.user?.profile?.first_name ?? '?';
                const ln = m.user?.profile?.last_name ?? '';
                const initials = `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarColor}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-slate-800 leading-tight truncate">{fn} {ln}</div>
                      {m.job_title && <div className="text-[11px] text-slate-400 truncate">{m.job_title}</div>}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {m.is_primary_contact && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 font-medium">
                          Contact
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[m.role] ?? 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'}`}>
                        {ROLE_LABEL[m.role] ?? m.role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {incubator.members.length > 5 && (
              <div className="px-5 py-3 border-t border-slate-100 text-center">
                <Link href={`/dashboard/incubator/${incubatorId}/members`}>
                  <span className="text-[12px] text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                    +{incubator.members.length - 5} autres membres
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}