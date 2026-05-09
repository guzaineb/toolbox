'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectOwnerProfile } from '@/hooks/useProjectOwnerProfile';
import { Button, Card, ErrorAlert, Field, Input, Select, Toggle, ProgressBar, Badge } from '@/components/shared/ui';
import { CreateSkillDto, CreateExperienceDto } from '@/types/projectOwner';

type OnboardingStep = 1 | 2 | 3;

export default function CreateProjectOwnerProfile() {
  const router = useRouter();
  const { profile, loading, saving, error, saveProfile, addSkill, deleteSkill, addExperience, deleteExperience, refetch } = useProjectOwnerProfile();
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(1);
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

  // Rediriger vers le dashboard si le profil est déjà complet
  useEffect(() => {
    if (profile && !loading) {
      const isProfileComplete = checkProfileCompleteness(profile);
      if (isProfileComplete) {
        router.push('/dashboard/project-owner');
      } else {
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
    }
  }, [profile, loading, router]);

  const checkProfileCompleteness = (profile: any) => {
    const requiredFields = ['current_status', 'education_level'];
    const hasRequiredFields = requiredFields.every(field => profile[field]);
    const hasSkillsOrExperiences = profile.skills?.length > 0 || profile.experiences?.length > 0;
    return hasRequiredFields && hasSkillsOrExperiences;
  };

  const handleStepSubmit = async () => {
    if (onboardingStep === 1) {
      if (form.current_status && form.education_level) {
        await saveProfile(form);
        setOnboardingStep(2);
      }
    } else if (onboardingStep === 2) {
      await saveProfile(form);
      setOnboardingStep(3);
    } else if (onboardingStep === 3) {
      await saveProfile(form);
      await refetch();
      router.push('/project-owner/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {onboardingStep === 1 && "Bienvenue ! Commençons par faire connaissance"}
            {onboardingStep === 2 && "Parlons de votre expérience entrepreneuriale"}
            {onboardingStep === 3 && "Finalisons votre profil"}
          </h1>
          <p className="text-gray-600">
            {onboardingStep === 1 && "Renseignez vos informations de base pour commencer"}
            {onboardingStep === 2 && "Dites-nous en plus sur votre parcours"}
            {onboardingStep === 3 && "Ajoutez vos compétences et expériences"}
          </p>
          <ProgressBar value={(onboardingStep / 3) * 100} className="mt-4" />
        </div>

        <Card className="p-6">
          {error && <ErrorAlert message={error} className="mb-4" />}
          
          {onboardingStep === 1 && (
            <OnboardingStep1 form={form} setForm={setForm} />
          )}

          {onboardingStep === 2 && (
            <OnboardingStep2 form={form} setForm={setForm} />
          )}

          {onboardingStep === 3 && (
            <OnboardingStep3
              profile={profile}
              form={form}
              setForm={setForm}
              showSkillModal={showSkillModal}
              setShowSkillModal={setShowSkillModal}
              showExpModal={showExpModal}
              setShowExpModal={setShowExpModal}
              addSkill={addSkill}
              deleteSkill={deleteSkill}
              addExperience={addExperience}
              deleteExperience={deleteExperience}
              refetch={refetch}
              saving={saving}
            />
          )}

          <div className="flex justify-end gap-3 mt-6">
            {onboardingStep > 1 && (
              <Button variant="secondary" onClick={() => setOnboardingStep(prev => (prev - 1) as OnboardingStep)}>
                Précédent
              </Button>
            )}
            <Button variant="primary" onClick={handleStepSubmit} loading={saving}>
              {onboardingStep === 3 ? "Terminer" : "Continuer"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Modals */}
      {showSkillModal && (
        <SkillModal
          onAdd={async (skill) => { 
            await addSkill(skill); 
            setShowSkillModal(false);
            await refetch();
          }}
          onClose={() => setShowSkillModal(false)}
          saving={saving}
        />
      )}
      {showExpModal && (
        <ExperienceModal
          onAdd={async (exp) => { 
            await addExperience(exp); 
            setShowExpModal(false);
            await refetch();
          }}
          onClose={() => setShowExpModal(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

// Composants d'étapes
function OnboardingStep1({ form, setForm }: { form: any; setForm: any }) {
  return (
    <div className="space-y-4">
      <Field label="Statut actuel" required>
        <Select 
          value={form.current_status} 
          onChange={e => setForm((f: any) => ({ ...f, current_status: e.target.value }))}
        >
          <option value="">— Sélectionner —</option>
          <option value="student">🎓 Étudiant</option>
          <option value="employee">💼 Salarié</option>
          <option value="entrepreneur">🚀 Entrepreneur</option>
          <option value="unemployed">🔍 Sans emploi</option>
        </Select>
      </Field>
      
      <Field label="Niveau d'études" required>
        <Select 
          value={form.education_level} 
          onChange={e => setForm((f: any) => ({ ...f, education_level: e.target.value }))}
        >
          <option value="">— Sélectionner —</option>
          <option value="bac">Baccalauréat</option>
          <option value="bac+2">Bac+2 (BTS, DUT)</option>
          <option value="bac+3">Bac+3 (Licence)</option>
          <option value="bac+5">Bac+5 (Master)</option>
          <option value="doctorat">Doctorat</option>
        </Select>
      </Field>
      
      <Field label="Domaine d'études">
        <Input 
          value={form.field_of_study} 
          onChange={e => setForm((f: any) => ({ ...f, field_of_study: e.target.value }))}
          placeholder="Ex: Informatique, Marketing, Finance..."
        />
      </Field>
    </div>
  );
}

function OnboardingStep2({ form, setForm }: { form: any; setForm: any }) {
  return (
    <div className="space-y-4">
      <Field label="Occupation actuelle">
        <Input 
          value={form.occupation} 
          onChange={e => setForm((f: any) => ({ ...f, occupation: e.target.value }))}
          placeholder="Ex: Développeur full-stack, Consultant, Étudiant..."
        />
      </Field>
      
      <Field label="Niveau d'expérience entrepreneuriale">
        <Select 
          value={form.entrepreneurial_experience_level} 
          onChange={e => setForm((f: any) => ({ ...f, entrepreneurial_experience_level: Number(e.target.value) }))}
        >
          <option value={0}>🌟 Aucune expérience - Je débute</option>
          <option value={1}>💡 Débutant - J'ai une idée</option>
          <option value={2}>📈 Intermédiaire - 1 à 3 startups</option>
          <option value={3}>🏆 Avancé - 3+ startups ou expérience significative</option>
        </Select>
      </Field>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <span className="font-medium">Expérience en startup</span>
          <p className="text-sm text-gray-600">Avez-vous déjà créé ou participé à une startup ?</p>
        </div>
        <Toggle 
          on={form.has_previous_startup} 
          onToggle={() => setForm((f: any) => ({ ...f, has_previous_startup: !f.has_previous_startup }))} 
        />
      </div>
    </div>
  );
}

function OnboardingStep3({ 
  profile, form, setForm, showSkillModal, setShowSkillModal, 
  showExpModal, setShowExpModal, addSkill, deleteSkill, 
  addExperience, deleteExperience, refetch, saving 
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Compétences</h3>
        <Button 
          variant="secondary" 
          onClick={() => setShowSkillModal(true)}
          className="mb-3"
        >
          + Ajouter une compétence
        </Button>
        {profile?.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: any) => (
              <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                {skill.skill_name} ({skill.level})
                <button onClick={() => deleteSkill(skill.id)} className="ml-1 text-red-500 hover:text-red-700">×</button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Aucune compétence pour l'instant. Ajoutez-en quelques-unes !</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-3">Expériences</h3>
        <Button 
          variant="secondary" 
          onClick={() => setShowExpModal(true)}
          className="mb-3"
        >
          + Ajouter une expérience
        </Button>
        {profile?.experiences && profile.experiences.length > 0 ? (
          <div className="space-y-3">
            {profile.experiences.map((exp: any) => (
              <div key={exp.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{exp.title}</h4>
                    <p className="text-sm text-gray-600">{exp.organization}</p>
                    {exp.start_date && (
                      <p className="text-xs text-gray-500">
                        {exp.start_date} → {exp.end_date || 'Présent'}
                      </p>
                    )}
                    {exp.description && (
                      <p className="text-sm mt-2">{exp.description}</p>
                    )}
                  </div>
                  <button onClick={() => deleteExperience(exp.id)} className="text-red-500 text-sm">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Aucune expérience pour l'instant. Ajoutez votre première expérience !</p>
        )}
      </div>

      <Field label="LinkedIn (optionnel)">
        <Input 
          value={form.linkedin_url} 
          onChange={e => setForm((f: any) => ({ ...f, linkedin_url: e.target.value }))}
          placeholder="https://linkedin.com/in/votre-profil"
        />
      </Field>
    </div>
  );
}

// Modals
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
          <Input 
            value={skillName} 
            onChange={e => setSkillName(e.target.value)} 
            placeholder="React, Python, Marketing, Gestion de projet..."
            autoFocus
          />
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
    await onAdd(form);
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