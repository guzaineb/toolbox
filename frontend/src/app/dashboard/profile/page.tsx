<<<<<<< HEAD
'use client'

import Link from 'next/link'
import { Badge, Button, Card } from '@/components/shared/ui'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { user } = useAuth()
  const profile = user?.profile as any
  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur'
  const initials =
    `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase() ||
    '??'

  const email = user?.email ?? '—'
  const phone = profile?.phone ?? '—'
  const country = profile?.country ?? '—'
  const city = profile?.city ?? '—'
  const bio =
    profile?.bio ??
    "Aucune biographie renseignée pour le moment."

  const roleBadges: string[] = user?.role || user?.role ? [user?.role] : []

  return (
    <div className="p-8 max-w-[800px]">
      {/* Tabs */}
      <div className="flex gap-0.5 bg-bg p-[3px] rounded-sm mb-[22px] border border-border w-fit">
        <span className="px-3.5 py-1.5 rounded-[5px] text-[12px] font-medium bg-surface text-text shadow-sm">
          Vue publique
        </span>

        <Link href="/dashboard/profile/edit">
          <span className="px-3.5 py-1.5 rounded-[5px] text-[12px] font-medium bg-transparent text-text-2 hover:text-text cursor-pointer">
=======
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Phone, MapPin, Calendar, Link2, Award } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const profile = user?.profile as any;

  const firstName = profile?.first_name ?? '';
  const lastName = profile?.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';
  const initials = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase() || '?';
  const email = user?.email ?? '—';
  const phone = profile?.phone ?? 'Non renseigné';
  const country = profile?.country ?? 'Non renseigné';
  const city = profile?.city ?? 'Non renseigné';
  const bio = profile?.bio ?? 'Aucune biographie renseignée pour le moment.';
  const birthDate = profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString() : null;
  const linkedinUrl = profile?.linkedin ?? null;
  const role = user?.role ?? null;

  const getRoleBadge = () => {
    if (!role) return null;
    const roleMap: Record<string, { label: string; variant: string }> = {
      admin: { label: 'Administrateur', variant: 'gold' },
      expert: { label: 'Expert', variant: 'teal' },
      project_owner: { label: 'Porteur de projet', variant: 'green' },
      incubator_membre: { label: 'Membre incubateur', variant: 'moss' },
    };
    const { label, variant } = roleMap[role] || { label: role, variant: 'default' };
    return <span className={`badge ${variant}`}>{label}</span>;
  };

  const completionFields = [
    !!firstName && !!lastName,
    !!email && email !== '—',
    !!phone && phone !== 'Non renseigné',
    !!country && country !== 'Non renseigné',
    !!city && city !== 'Non renseigné',
    !!bio && bio !== 'Aucune biographie renseignée pour le moment.',
    !!profile?.birth_date,
    !!linkedinUrl,
  ];
  const completionPercent = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex gap-0.5 bg-cream p-1 rounded-md mb-6 border border-border w-fit">
        <span className="px-4 py-1.5 rounded-md text-xs font-medium bg-surface text-ink shadow-sm">Vue publique</span>
        <Link href="/dashboard/profile/edit">
          <span className="px-4 py-1.5 rounded-md text-xs font-medium bg-transparent text-ink2 hover:text-ink cursor-pointer transition-colors">
>>>>>>> 38c6efc (Misa a jour les interfaces)
            Modifier
          </span>
        </Link>
      </div>

<<<<<<< HEAD
      {/* Header */}
      <div className="flex gap-5 items-start mb-6">
        <div className="w-14 h-14 rounded-full bg-accent-light text-accent flex items-center justify-center text-[18px] font-semibold flex-shrink-0">
          {initials}
        </div>

        <div>
          <h1 className="text-[22px] font-bold mb-0.5">
            {fullName}
          </h1>

          <p className="text-[13px] text-text-2 mb-2">
            {city}, {country}
          </p>

          <div className="flex gap-1.5 flex-wrap">
            {roleBadges.length > 0 ? (
              roleBadges.map((role, i) => (
                <Badge key={i} variant="blue">
                  {role}
                </Badge>
              ))
            ) : (
              <Badge variant="gray">Utilisateur</Badge>
            )}
          </div>
        </div>

        <Link href="/dashboard/profile/edit" className="ml-auto">
          <Button>Modifier le profil</Button>
        </Link>
      </div>

      {/* About */}
      <Card className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          À propos
        </div>
        <p className="text-[13px] text-text-2 leading-relaxed">
          {bio}
        </p>
      </Card>

      {/* Info */}
      <Card>
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          Informations
        </div>

        <div className="grid grid-cols-2 gap-2 text-[13px]">
          <div>
            <span className="text-text-3">Email</span><br />
            <span>{email}</span>
          </div>

          <div>
            <span className="text-text-3">Téléphone</span><br />
            <span>{phone}</span>
          </div>

          <div>
            <span className="text-text-3">Pays</span><br />
            <span>{country}</span>
          </div>

          <div>
            <span className="text-text-3">Ville</span><br />
            <span>{city}</span>
          </div>
        </div>
      </Card>
    </div>
  )
=======
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-moss to-moss-light text-white flex items-center justify-center text-2xl font-bold shadow-md flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-syne text-ink">{fullName}</h1>
              <p className="text-sm text-ink2 mt-1 flex items-center gap-1">
                <MapPin size={14} /> {city}, {country}
              </p>
            </div>
            <Link href="/dashboard/profile/edit">
              <button className="btn-primary">Modifier le profil</button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {getRoleBadge()}
            {completionPercent < 100 && (
              <span className="badge draft">Complétion {completionPercent}%</span>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink2">Complétion du profil</span>
            <span className="text-sm font-bold text-moss">{completionPercent}%</span>
          </div>
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${completionPercent}%` }} />
          </div>
          <p className="text-xs text-ink3 mt-2">
            {completionPercent === 100
              ? '✓ Profil complet ! Vous êtes visible par les incubateurs et experts.'
              : 'Un profil complet augmente vos chances d’être mis en relation.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <h2 className="section-title flex items-center gap-2">
              <User size={18} /> À propos
            </h2>
            <p className="text-sm text-ink2 leading-relaxed mt-3">{bio}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 className="section-title flex items-center gap-2">
              <Award size={18} /> Informations
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-ink3 mt-0.5" />
                <div>
                  <div className="text-xs text-ink3">Email</div>
                  <div className="text-sm font-medium">{email}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-ink3 mt-0.5" />
                <div>
                  <div className="text-xs text-ink3">Téléphone</div>
                  <div className="text-sm font-medium">{phone}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-ink3 mt-0.5" />
                <div>
                  <div className="text-xs text-ink3">Localisation</div>
                  <div className="text-sm font-medium">{city}, {country}</div>
                </div>
              </div>
              {birthDate && (
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-ink3 mt-0.5" />
                  <div>
                    <div className="text-xs text-ink3">Date de naissance</div>
                    <div className="text-sm font-medium">{birthDate}</div>
                  </div>
                </div>
              )}
              {linkedinUrl && (
                <div className="flex items-start gap-3">
                  <Link2 size={16} className="text-ink3 mt-0.5" />
                  <div>
                    <div className="text-xs text-ink3">LinkedIn</div>
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-moss hover:underline"
                    >
                      Voir le profil
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {profile?.preferred_language && (
        <div className="card mt-6">
          <div className="card-body">
            <h2 className="section-title flex items-center gap-2">🌐 Préférences</h2>
            <div className="mt-2 text-sm">
              <span className="text-ink3">Langue préférée :</span>{' '}
              <span className="font-medium">
                {profile.preferred_language === 'fr' ? 'Français' : profile.preferred_language}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
>>>>>>> 38c6efc (Misa a jour les interfaces)
}