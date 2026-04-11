"use client";


import { Step3Data, Step3Errors } from "@/types/register";
import { Input } from "./ui";


interface RoleFormProps {
  data: Partial<Step3Data>; 
  onFieldChange: (key: keyof Step3Data, value: any) => void;
}

export function ExpertForm({ data, errors, onFieldChange }: RoleFormProps) {
  return (
    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex flex-col gap-4">
      <h4 className="font-semibold text-sm text-gray-900 mb-1">Profil Expert</h4>
      
      <Input
        label="Headline"
        placeholder="Développeur Fullstack | 10+ ans d'expérience"
        value={data.expertHeadline || ""}
        onChange={(e) => onFieldChange("expertHeadline", e.target.value)}
        error={errors.expertHeadline}
      />

      <Input
        label="Bio courte"
        placeholder="Votre expertise en quelques mots..."
        value={data.expertBio || ""}
        onChange={(e) => onFieldChange("expertBio", e.target.value)}
        error={errors.expertBio}
      />

      <Input
        label="Années d'expérience"
        type="number"
        placeholder="10"
        value={data.expertExperienceYears || ""}
        onChange={(e) => onFieldChange("expertExperienceYears", parseInt(e.target.value) || 0)}
        error={errors.expertExperienceYears}
      />
    </div>
  );
}

export function ProjectOwnerForm({ data, errors, onFieldChange }: RoleFormProps) {
  return (
    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex flex-col gap-4">
      <h4 className="font-semibold text-sm text-gray-900 mb-1">Porteur de Projet</h4>
      
      <Input
        label="Statut actuel"
        placeholder="Étudiant / Salarié / Entrepreneur"
        value={data.projectOwnerStatus || ""}
        onChange={(e) => onFieldChange("projectOwnerStatus", e.target.value)}
        error={errors.projectOwnerStatus}
      />

      <Input
        label="Formation"
        placeholder="Ingénieur informatique"
        value={data.projectOwnerEducation || ""}
        onChange={(e) => onFieldChange("projectOwnerEducation", e.target.value)}
        error={errors.projectOwnerEducation}
      />
    </div>
  );
}

export function IncubatorMemberForm() {
  return (
    <div className="p-4 border border-violet-100 rounded-xl bg-violet-50/30">
      <h4 className="font-semibold text-sm text-violet-900 mb-2">Membre Incubateur</h4>
      <p className="text-xs text-violet-600 leading-relaxed">
        Vous pourrez créer ou rejoindre votre incubateur directement depuis votre tableau de bord après avoir terminé l'onboarding.
      </p>
    </div>
  );
}