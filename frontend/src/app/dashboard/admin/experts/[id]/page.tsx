'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expertService } from '@/services/expert.service';
import { ExpertProfile } from '@/types/expert';
import { AvailabilityBadge } from '@/components/expert/AvailabilityBadge';
import { ArrowLeft, Briefcase, Award, Loader2 } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

export default function AdminExpertDetailPage() {
  const params = useParams();
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await expertService.getExpertById(params.id as string);
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
        <h1 className="text-2xl font-bold text-ink mb-2">Expert non trouvé</h1>
        <p className="text-ink3 mb-6">{error || "Le profil demandé n'existe pas"}</p>
        <Link href="/dashboard/admin/experts" className="text-moss hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <Link href="/dashboard/admin/experts" className="inline-flex items-center gap-2 text-sm text-ink3 hover:text-ink">
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste des experts
      </Link>

      <div className="bg-white rounded-xl border border-border p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-ink">{profile.headline}</h1>
              <AvailabilityBadge status={profile.availability_status} size="md" />
            </div>
            {(profile.organization || profile.position) && (
              <p className="text-ink2 text-lg">
                {profile.position}{profile.position && profile.organization && ' chez '}{profile.organization}
              </p>
            )}
            {profile.years_of_experience && (
              <p className="text-ink3 mt-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {profile.years_of_experience} ans d&apos;expérience
              </p>
            )}
          </div>
        </div>
        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-border">
            <h2 className="text-sm font-medium text-ink3 uppercase mb-2">Biographie</h2>
            <p className="text-ink2 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}
        {profile.user?.email && (
          <p className="text-sm text-ink3 mt-4">
            <span className="font-medium">Email :</span> {profile.user.email}
          </p>
        )}
        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-moss hover:text-moss/80 mt-4"
          >
            <FaLinkedin className="w-4 h-4" />
            Voir le profil LinkedIn
          </a>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border p-8">
        <h2 className="text-lg font-semibold text-ink mb-4">Domaines d&apos;expertise</h2>
        {profile.expertiseConnections?.length === 0 ? (
          <p className="text-ink3">Aucun domaine d&apos;expertise renseigné</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.expertiseConnections?.map(conn => (
              <div key={conn.id} className="flex items-center justify-between p-3 bg-moss/[.03] rounded-lg border border-moss/10">
                <div>
                  <p className="font-medium text-ink">{conn.expertiseArea.name}</p>
                  <div className="flex items-center gap-2 text-sm text-ink3 mt-1">
                    <Award className="w-3 h-3" />
                    <span className="capitalize">Niveau {conn.level}</span>
                    <span>•</span>
                    <span>{conn.years_of_experience} ans</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
