// src/components/expert/ExpertProfileCard.tsx
'use client';

import { ExpertProfile } from '@/types/expert';
import { AvailabilityBadge } from './AvailabilityBadge';

interface ExpertProfileCardProps {
  profile: ExpertProfile;
  variant?: 'compact' | 'full';
  onEdit?: () => void;
}

export function ExpertProfileCard({ profile, variant = 'full', onEdit }: ExpertProfileCardProps) {
  const userName = profile.user?.profile 
    ? `${profile.user.profile.first_name} ${profile.user.profile.last_name}`
    : profile.user?.email || 'Expert';

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{profile.headline}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {profile.organization && `${profile.organization}`}
              {profile.position && ` • ${profile.position}`}
            </p>
            <div className="mt-2">
              <AvailabilityBadge status={profile.availability_status} size="sm" />
            </div>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✏️
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{userName}</h2>
            <p className="text-gray-300 text-sm mt-1">{profile.user?.email}</p>
          </div>
          <AvailabilityBadge status={profile.availability_status} size="lg" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Headline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{profile.headline}</h3>
        </div>

        {/* Organization & Position */}
        {(profile.organization || profile.position) && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {profile.organization && (
              <div className="flex items-center gap-2">
                <span>🏢</span>
                <span>{profile.organization}</span>
              </div>
            )}
            {profile.position && (
              <div className="flex items-center gap-2">
                <span>💼</span>
                <span>{profile.position}</span>
              </div>
            )}
            {profile.years_of_experience && (
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{profile.years_of_experience} ans d'expérience</span>
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Biographie</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Expertise Areas */}
{profile.expertiseConnections.length > 0 && (
  <div>
    <h4 className="font-medium text-gray-700 mb-3">
      Domaines d'expertise
    </h4>

    <div className="flex flex-wrap gap-2">
      {profile.expertiseConnections.map((connection) => (
        <div
          key={connection.id}
          className="px-3 py-2 bg-gray-100 rounded-full flex items-center gap-2"
        >
          <span className="text-sm text-gray-700">
            {connection.expertiseArea.name}
          </span>

          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            {connection.level}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

        {/* LinkedIn */}
        {profile.linkedin_url && (
          <div>
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <span>🔗</span>
              <span>LinkedIn</span>
            </a>
          </div>
        )}

        {/* Edit Button */}
        {onEdit && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              Modifier mon profil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}