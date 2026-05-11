'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectOwnerProfile } from '@/hooks/useProjectOwnerProfile';
import { Button, Card, Field, Input, Select, Toggle, Badge, ProgressBar } from '@/components/shared/ui';
import { CreateSkillDto, CreateExperienceDto } from '@/types/projectOwner';

const cleanForm = (data: any) => {
  const cleaned: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

export default function ProjectOwnerDashboard() {
  const router = useRouter();
  const { profile, loading, saving, error, saveProfile, addSkill, deleteSkill, addExperience, deleteExperience, refetch } = useProjectOwnerProfile();
  const [editMode, setEditMode] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [form, setForm] = useState({
    current_status: '',
    education_level: '',
    field_of_study: '',
    occupation: '',
    entrepreneurial_experience_level: 0,
    has_previous_startup: false,
    linkedin_url: '',
  });

  // Pré-remplir le formulaire quand on passe en mode édition
  useEffect(() => {
    if (editMode && profile) {
      setForm({
        current_status: profile.current_status || '',
        education_level: profile.education_level || '',
        field_of_study: profile.field_of_study || '',
        occupation: profile.occupation || '',
        entrepreneurial_experience_level: profile.entrepreneurial_experience_level || 0,
        has_previous_startup: profile.has_previous_startup || false,
        linkedin_url: profile.linkedin_url || '',
      });
    }
  }, [editMode, profile]);

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    let completed = 0;
    let total = 7;
    
    if (profile.current_status) completed++;
    if (profile.education_level) completed++;
    if (profile.field_of_study) completed++;
    if (profile.occupation) completed++;
    if (profile.entrepreneurial_experience_level > 0) completed++;
    if (profile.has_previous_startup) completed++;
    if (profile.linkedin_url) completed++;
    
    if (profile.skills?.length > 0) completed += Math.min(profile.skills.length, 2);
    if (profile.experiences?.length > 0) completed += Math.min(profile.experiences.length, 2);
    
    total += 4;
    return Math.min(Math.floor((completed / total) * 100), 100);
  };

  const handleEditSubmit = async () => {
    await saveProfile(cleanForm(form));
    setEditMode(false);
    await refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Mode édition (seulement si un profil existe)
  if (editMode && profile) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Modifier mon profil</h1>
        <Card className="space-y-4">
          <Field label="Statut actuel">
            <Select value={form.current_status} onChange={e => setForm(f => ({ ...f, current_status: e.target.value }))}>
              <option value="">— Sélectionner —</option>
              <option value="student">Étudiant</option>
              <option value="employee">Salarié</option>
              <option value="entrepreneur">Entrepreneur</option>
              <option value="unemployed">Sans emploi</option>
            </Select>
          </Field>
          <Field label="Niveau d'études">
            <Select value={form.education_level} onChange={e => setForm(f => ({ ...f, education_level: e.target.value }))}>
              <option value="">— Sélectionner —</option>
              <option value="bac">Bac</option>
              <option value="bac+2">Bac+2</option>
              <option value="bac+3">Bac+3 (Licence)</option>
              <option value="bac+5">Bac+5 (Master)</option>
              <option value="doctorat">Doctorat</option>
            </Select>
          </Field>
          <Field label="Domaine d'études">
            <Input value={form.field_of_study} onChange={e => setForm(f => ({ ...f, field_of_study: e.target.value }))} />
          </Field>
          <Field label="Occupation">
            <Input value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} />
          </Field>
          <Field label="Expérience entrepreneuriale">
            <Select value={form.entrepreneurial_experience_level} onChange={e => setForm(f => ({ ...f, entrepreneurial_experience_level: Number(e.target.value) }))}>
              <option value={0}>Aucune expérience</option>
              <option value={1}>Débutant (idée)</option>
              <option value={2}>Intermédiaire (1–3 startups)</option>
              <option value={3}>Avancé (3+ startups)</option>
            </Select>
          </Field>
          <div className="flex items-center gap-2">
            <span>Expérience startup précédente</span>
            <Toggle on={form.has_previous_startup} onToggle={() => setForm(f => ({ ...f, has_previous_startup: !f.has_previous_startup }))} />
          </div>
          <Field label="LinkedIn">
            <Input value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} />
          </Field>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setEditMode(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleEditSubmit} loading={saving}>Mettre à jour</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Si aucun profil n'existe, afficher un message invitant à en créer un
  if (!profile) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <Card className="p-12">
          <h2 className="text-2xl font-bold mb-4">Aucun profil trouvé</h2>
          <p className="text-gray-600 mb-6">Vous n'avez pas encore créé votre profil porteur de projet.</p>
          <Button variant="primary" onClick={() => router.push('/dashboard/project-owner/create')}>
            Créer mon profil
          </Button>
        </Card>
      </div>
    );
  }

  // Vue du profil (mode consultation)
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mon profil porteur de projet</h1>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Complétion du profil :</span>
              <ProgressBar value={getCompletionPercentage()} className="w-48" />
              <span className="text-sm font-medium">{getCompletionPercentage()}%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push('/project-owner/create')}>
            Compléter mon profil
          </Button>
          <Button variant="primary" onClick={() => setEditMode(true)}>
            Modifier
          </Button>
        </div>
      </div>

      {/* Cartes d'information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> Informations personnelles
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Statut :</span>
              <span className="font-medium">{profile.current_status || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Niveau d'études :</span>
              <span className="font-medium">{profile.education_level || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Domaine :</span>
              <span className="font-medium">{profile.field_of_study || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Occupation :</span>
              <span className="font-medium">{profile.occupation || 'Non renseigné'}</span>
            </div>
            {profile.linkedin_url && (
              <div className="flex justify-between">
                <span className="text-gray-600">LinkedIn :</span>
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Voir le profil
                </a>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🚀</span> Parcours entrepreneurial
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Expérience :</span>
              <span className="font-medium">
                {profile.entrepreneurial_experience_level === 0 && "🌟 Débutant"}
                {profile.entrepreneurial_experience_level === 1 && "💡 Idée en développement"}
                {profile.entrepreneurial_experience_level === 2 && "📈 Intermédiaire"}
                {profile.entrepreneurial_experience_level === 3 && "🏆 Avancé"}
                {!profile.entrepreneurial_experience_level && "Non renseigné"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expérience startup :</span>
              <span className="font-medium">{profile.has_previous_startup ? '✅ Oui' : '❌ Non'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Compétences et expériences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>⚡</span> Compétences
            </h2>
            <Button variant="secondary" size="sm" onClick={() => setShowSkillModal(true)}>
              + Ajouter
            </Button>
          </div>
          {profile.skills?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune compétence renseignée</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map(skill => (
                <Badge key={skill.id} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {skill.skill_name}
                  <span className="text-xs text-gray-500">({skill.level})</span>
                  <button onClick={() => deleteSkill(skill.id)} className="ml-2 text-red-500 hover:text-red-700">×</button>
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>💼</span> Expériences
            </h2>
            <Button variant="secondary" size="sm" onClick={() => setShowExpModal(true)}>
              + Ajouter
            </Button>
          </div>
          {profile.experiences?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune expérience renseignée</p>
          ) : (
            <div className="space-y-4">
              {profile.experiences?.map(exp => (
                <div key={exp.id} className="border-b last:border-0 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-sm text-gray-600">{exp.organization}</p>
                      {exp.start_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(exp.start_date).toLocaleDateString()} → {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Présent'}
                        </p>
                      )}
                      {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                    </div>
                    <button onClick={() => deleteExperience(exp.id)} className="text-red-500 text-sm">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modales */}
      {showSkillModal && (
        <SkillModal
          onAdd={async (skill) => { await addSkill(skill); setShowSkillModal(false); }}
          onClose={() => setShowSkillModal(false)}
          saving={saving}
        />
      )}
      {showExpModal && (
        <ExperienceModal
          onAdd={async (exp) => { await addExperience(exp); setShowExpModal(false); }}
          onClose={() => setShowExpModal(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

function SkillModal({ onAdd, onClose, saving }: { onAdd: (skill: CreateSkillDto) => Promise<void>; onClose: () => void; saving: boolean }) {
  const [skillName, setSkillName] = useState('');
  const [level, setLevel] = useState<CreateSkillDto['level']>('beginner');

  const handleSubmit = async () => {
    if (!skillName.trim()) return;
    await onAdd({ skill_name: skillName, level });
    setSkillName('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Ajouter une compétence</h3>
        <Field label="Nom de la compétence">
          <Input value={skillName} onChange={e => setSkillName(e.target.value)} placeholder="React, Python, Marketing..." autoFocus />
        </Field>
        <Field label="Niveau">
          <Select value={level} onChange={e => setLevel(e.target.value as any)}>
            <option value="beginner">🌱 Débutant</option>
            <option value="intermediate">📚 Intermédiaire</option>
            <option value="advanced">🚀 Avancé</option>
            <option value="expert">🏆 Expert</option>
          </Select>
        </Field>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>Ajouter</Button>
        </div>
      </div>
    </div>
  );
}

function ExperienceModal({ onAdd, onClose, saving }: { onAdd: (exp: CreateExperienceDto) => Promise<void>; onClose: () => void; saving: boolean }) {
  const [form, setForm] = useState<CreateExperienceDto>({ title: '', organization: '', description: '', start_date: '', end_date: '' });

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.organization.trim()) return;
    
    const payload: CreateExperienceDto = {
      title: form.title,
      organization: form.organization,
      description: form.description || undefined,
    };
    if (form.start_date) payload.start_date = form.start_date;
    if (form.end_date) payload.end_date = form.end_date;
    
    await onAdd(payload);
    setForm({ title: '', organization: '', description: '', start_date: '', end_date: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Ajouter une expérience</h3>
        <Field label="Titre *">
          <Input 
            value={form.title} 
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
            placeholder="Chef de produit, Développeur, Fondateur..."
          />
        </Field>
        <Field label="Organisation *">
          <Input 
            value={form.organization} 
            onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} 
            placeholder="Startup XYZ, Entreprise ABC..."
          />
        </Field>
        <Field label="Description">
          <Input 
            value={form.description} 
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
            placeholder="Décrivez vos responsabilités et réalisations..."
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date de début">
            <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
          </Field>
          <Field label="Date de fin">
            <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>Ajouter</Button>
        </div>
      </div>
    </div>
  );
}