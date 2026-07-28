'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Briefcase, GraduationCap, Zap, Calendar } from 'lucide-react';
import { Badge, Card, CardHeader } from '@/components/shared/ui';
import api from '@/services/api';
import { ProjectOwnerProfile } from '@/types/projectOwner';

const STATUS_LABEL: Record<string, string> = {
  student: 'Étudiant',
  employee: 'Salarié',
  entrepreneur: 'Entrepreneur',
  unemployed: 'Sans emploi',
};

const EDU_LABEL: Record<string, string> = {
  bac: 'Bac',
  'bac+2': 'Bac+2',
  'bac+3': 'Bac+3 (Licence)',
  'bac+5': 'Bac+5 (Master)',
  doctorat: 'Doctorat',
};

const EXP_LEVEL_LABEL: Record<number, { label: string; variant: 'green' | 'blue' | 'amber' | 'gray' }> = {
  0: { label: 'Débutant', variant: 'gray' },
  1: { label: 'Idée en développement', variant: 'green' },
  2: { label: 'Intermédiaire', variant: 'blue' },
  3: { label: 'Avancé', variant: 'amber' },
};

export default function AdminProjectOwnerDetailPage() {
  const params = useParams();
  const [profile, setProfile] = useState<ProjectOwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/project-owner/${params.id}`);
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-moss" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-ink mb-2">Porteur de projet non trouvé</h1>
        <p className="text-ink3 mb-6">{error || "Le profil demandé n'existe pas"}</p>
        <Link href="/dashboard/admin/project-owners" className="text-moss hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const expLevel = profile.entrepreneurial_experience_level ?? 0;
  const expConfig = EXP_LEVEL_LABEL[expLevel] || EXP_LEVEL_LABEL[0];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <Link href="/dashboard/admin/project-owners" className="inline-flex items-center gap-2 text-sm text-ink3 hover:text-ink">
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste des porteurs de projet
      </Link>

      <div className="bg-white rounded-xl border border-border p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-2">
              {profile.user?.profile?.first_name} {profile.user?.profile?.last_name}
            </h1>
            {profile.user?.email && (
              <p className="text-ink3">{profile.user.email}</p>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant={expConfig.variant}>{expConfig.label}</Badge>
              {profile.has_previous_startup && <Badge variant="green">Startup expérimenté</Badge>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">{profile.skills?.length || 0}</div>
            <div className="text-sm text-ink3">Compétences</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">{profile.experiences?.length || 0}</div>
            <div className="text-sm text-ink3">Expériences</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">{expLevel}</div>
            <div className="text-sm text-ink3">Niveau</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">{profile.has_previous_startup ? 'Oui' : 'Non'}</div>
            <div className="text-sm text-ink3">Startup</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<GraduationCap size={13} />} title="Informations" />
          <div className="px-[18px] py-2 divide-y divide-border">
            <div className="py-[9px]">
              <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.1em] mb-[2px]">Statut</div>
              <div className="text-[13px] font-medium text-ink">
                {profile.current_status ? STATUS_LABEL[profile.current_status] : 'Non renseigné'}
              </div>
            </div>
            <div className="py-[9px]">
              <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.1em] mb-[2px]">Niveau d&apos;études</div>
              <div className="text-[13px] font-medium text-ink">
                {profile.education_level ? EDU_LABEL[profile.education_level] : 'Non renseigné'}
              </div>
            </div>
            <div className="py-[9px]">
              <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.1em] mb-[2px]">Domaine</div>
              <div className="text-[13px] font-medium text-ink">{profile.field_of_study || 'Non renseigné'}</div>
            </div>
            <div className="py-[9px]">
              <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.1em] mb-[2px]">Occupation</div>
              <div className="text-[13px] font-medium text-ink">{profile.occupation || 'Non renseigné'}</div>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<Zap size={13} />} title="Compétences" />
          <div className="p-[16px_18px]">
            {!profile.skills?.length ? (
              <p className="text-[12px] text-ink3">Aucune compétence renseignée</p>
            ) : (
              <div className="space-y-2">
                {profile.skills.map(skill => (
                  <div key={skill.id} className="flex items-center justify-between p-2 bg-moss/[.03] rounded-lg">
                    <span className="text-[13px] font-medium text-ink">{skill.skill_name}</span>
                    <Badge variant="gray" className="text-[9px]">{skill.level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {profile.experiences?.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<Briefcase size={13} />} title="Expériences" />
          <div className="divide-y divide-border">
            {profile.experiences.map(exp => (
              <div key={exp.id} className="px-[18px] py-[12px]">
                <div className="text-[13px] font-semibold text-ink">{exp.title}</div>
                <div className="text-[11px] text-ink3 mt-0.5">{exp.organization}</div>
                {(exp.start_date || exp.end_date) && (
                  <div className="flex items-center gap-1 text-[10px] text-ink3 mt-1">
                    <Calendar size={10} />
                    {exp.start_date ? new Date(exp.start_date).toLocaleDateString('fr-FR') : '—'}
                    {' → '}
                    {exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR') : 'Présent'}
                  </div>
                )}
                {exp.description && (
                  <p className="text-[12px] text-ink2 mt-2 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
