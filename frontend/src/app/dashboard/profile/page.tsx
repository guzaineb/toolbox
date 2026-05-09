// app/dashboard/profile/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

import { User, Mail, Phone, MapPin, Calendar, Link2, Award } from "lucide-react";
import { Avatar, Badge, Button, Card, ProgressBar, TabNav } from "@/components/shared/ui";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const profile = user?.profile;

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!user) return <div className="p-8">Non authentifié</div>;

  const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "Utilisateur";
  const initials = `${profile?.first_name?.charAt(0) ?? ""}${profile?.last_name?.charAt(0) ?? ""}`.toUpperCase() || "?";
  const email = user.email;
  const phone = profile?.phone || "Non renseigné";
  const country = profile?.country || "Non renseigné";
  const city = profile?.city || "Non renseigné";
  const bio = profile?.bio || "Aucune biographie renseignée pour le moment.";
  const birthDate = profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString() : null;
  const linkedinUrl = profile?.linkedin;

  const getRoleBadge = () => {
    const role = user.role;
    if (!role) return null;
    const roleMap: Record<string, { label: string; variant: "green" | "blue" | "amber" | "gray" }> = {
      admin: { label: "Administrateur", variant: "amber" },
      expert: { label: "Expert", variant: "blue" },
      project_owner: { label: "Porteur de projet", variant: "green" },
      incubator_membre: { label: "Membre incubateur", variant: "gray" },
    };
    const matched = roleMap[role];
    if (!matched) return null;
    return <Badge variant={matched.variant}>{matched.label}</Badge>;
  };

  // Calcul du taux de complétion (8 champs)
  const completionFields = [
    !!profile?.first_name && !!profile?.last_name,
    !!email,
    profile?.phone && profile.phone !== "Non renseigné",
    profile?.country && profile.country !== "Non renseigné",
    profile?.city && profile.city !== "Non renseigné",
    profile?.bio && profile.bio !== "Aucune biographie renseignée pour le moment.",
    !!profile?.birth_date,
    !!profile?.linkedin,
  ];
  const completionPercent = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  // Onglets pour la vue publique (selon votre template, il y a "Vue publique" et "Modifier")
  const tabs = [
    { id: "public", label: "Vue publique" },
    { id: "edit", label: "Modifier" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Navigation par onglets (réutilise TabNav) */}
      <TabNav
        tabs={tabs}
        active="public"
        onChange={(id) => {
          if (id === "edit") window.location.href = "/dashboard/profile/edit";
        }}
      />

      {/* En-tête avec avatar */}
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
        <Avatar initials={initials} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-syne text-ink">{fullName}</h1>
              <p className="text-sm text-ink2 mt-1 flex items-center gap-1">
                <MapPin size={14} /> {city}, {country}
              </p>
            </div>
            <Link href="/dashboard/profile/edit">
              <Button variant="primary">Modifier le profil</Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {getRoleBadge()}
            {completionPercent < 100 && (
              <Badge variant="gray">Complétion {completionPercent}%</Badge>
            )}
          </div>
        </div>
      </div>
      {/* Grille d'informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold font-syne flex items-center gap-2 mb-4">
            <User size={18} /> À propos
          </h2>
          <p className="text-sm text-ink2 leading-relaxed">{bio}</p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold font-syne flex items-center gap-2 mb-4">
            <Award size={18} /> Informations
          </h2>
          <div className="space-y-3">
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
                    className="text-sm text-accent hover:underline"
                  >
                    Voir le profil
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Préférences */}
      {profile?.preferred_language && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold font-syne flex items-center gap-2 mb-2">
            🌐 Préférences
          </h2>
          <div className="text-sm">
            <span className="text-ink3">Langue préférée :</span>{" "}
            <span className="font-medium">
              {profile.preferred_language === "fr"
                ? "Français"
                : profile.preferred_language === "ar"
                ? "Arabe"
                : "Anglais"}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}