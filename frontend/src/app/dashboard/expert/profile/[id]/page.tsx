'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { expertService } from '@/services/expert.service';
import { ExpertProfile } from '@/types/expert';
import { AvailabilityBadge } from '@/components/expert/AvailabilityBadge';
import { ArrowLeft , Briefcase, Calendar, Award } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
export default function PublicExpertProfilePage() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Expert non trouvé</h1>
        <p className="text-gray-600 mb-6">{error || "Le profil demandé n'existe pas"}</p>
        <Link href="/dashboard/experts" className="text-gray-600 hover:text-gray-900">
          ← Voir tous les experts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link href="/dashboard/experts" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Tous les experts
      </Link>

      {/* En-tête du profil */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.headline}</h1>
              <AvailabilityBadge status={profile.availability_status} size="md" />
            </div>
            
            {(profile.organization || profile.position) && (
              <p className="text-gray-600 text-lg">
                {profile.position}{profile.position && profile.organization && ' chez '}{profile.organization}
              </p>
            )}
            
            {profile.years_of_experience && (
              <p className="text-gray-500 mt-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {profile.years_of_experience} ans d'expérience
              </p>
            )}
          </div>
        </div>
        
        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">Biographie</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}
        
        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-4"
          >
            <FaLinkedin    className="w-4 h-4" />
            Voir le profil LinkedIn
          </a>
        )}
      </div>

      {/* Expertises */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Domaines d'expertise</h2>
        
        {profile.expertiseConnections?.length === 0 ? (
          <p className="text-gray-500">Aucun domaine d'expertise renseigné</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.expertiseConnections?.map(conn => (
              <div key={conn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{conn.expertiseArea.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Award className="w-3 h-3" />
                    <span className="capitalize">Niveau {conn.level}</span>
                    <span>•</span>
                    <span>{conn.years_of_experience} ans d'expérience</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{profile.expertiseConnections?.length || 0}</p>
            <p className="text-sm text-gray-500">Expertises</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{profile.years_of_experience || 0}</p>
            <p className="text-sm text-gray-500">Années d'expérience</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 capitalize">{profile.availability_status === 'available' ? 'Disponible' : profile.availability_status === 'busy' ? 'Occupé' : 'Indisponible'}</p>
            <p className="text-sm text-gray-500">Statut</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {new Date(profile.created_at || Date.now()).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">Membre depuis</p>
          </div>
        </div>
      </div>
    </div>
  );
}