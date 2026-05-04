export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';
export type ExpertiseLevel = 'junior' | 'intermediate' | 'senior' | 'expert';

export interface ExpertiseArea {
  id: string;
  name: string;
  category: string;
}

export interface ExpertiseConnection {
  id: string;
  level: ExpertiseLevel;
  years_of_experience: number;
  expertiseArea: ExpertiseArea;
  created_at?: string;
  updated_at?: string;
}

export interface ExpertProfile {
  id: string;
  headline: string;
  bio?: string;
  organization?: string;
  position?: string;
  years_of_experience?: number;
  linkedin_url?: string;
  availability_status: AvailabilityStatus;
  expertiseConnections: ExpertiseConnection[];
  user?: {
    id: string;
    email: string;
    profile?: {
      first_name: string;
      last_name: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface ExpertScore {
  score: number;
  details: {
    experience: { years: number; score: number };
    diversity: { count: number; score: number };
    levels: { average: number; score: number };
    availability: { status: string; score: number };
  };
}

export interface ProjectMatch {
  matchPercentage: number;
  details: {
    skillsMatch: { matched: number; required: number; score: number };
    experienceMatch: { years: number; required: number; score: number };
    availabilityBonus?: number;
  };
}

export interface CreateExpertDto {
  headline: string;
  bio?: string;
  organization?: string;
  position?: string;
  years_of_experience?: number;
  linkedin_url?: string;
  expertiseAreaIds: string[];
}

export interface UpdateExpertDto {
  headline?: string;
  bio?: string;
  organization?: string;
  position?: string;
  years_of_experience?: number;
  linkedin_url?: string;
  availability_status?: AvailabilityStatus;
  expertiseAreaIds?: string[];
}

export interface AddExpertiseDto {
  expertiseAreaId: string;
  level?: ExpertiseLevel;
  years_of_experience?: number;
}

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Disponible',
  busy: 'Occupé(e)',
  unavailable: 'Indisponible',
};

export const AVAILABILITY_BG_COLORS: Record<AvailabilityStatus, string> = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-yellow-100 text-yellow-800',
  unavailable: 'bg-red-100 text-red-800',
};

export const LEVEL_LABELS: Record<ExpertiseLevel, string> = {
  junior: 'Junior',
  intermediate: 'Intermédiaire',
  senior: 'Senior',
  expert: 'Expert',
};

export const LEVEL_COLORS: Record<ExpertiseLevel, string> = {
  junior: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-green-100 text-green-800',
  senior: 'bg-yellow-100 text-yellow-800',
  expert: 'bg-purple-100 text-purple-800',
};
export interface SelectedExpertise {
  id: string;
  areaId: string;
  areaName: string;
  level: ExpertiseLevel;
  yearsOfExperience: number;
  connectionId?: string; 
}