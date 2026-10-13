import type { Paginated } from './pagination';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';

export type ExpertiseLevel =
  | 'junior'
  | 'intermediate'
  | 'senior'
  | 'expert';

/* =========================================================
   BASE ENTITIES
========================================================= */

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

export interface UserProfile {
  first_name: string;
  last_name: string;
}

export interface ExpertUser {
  id: string;
  email: string;
  profile?: UserProfile;
}

/* =========================================================
   MAIN EXPERT PROFILE
========================================================= */

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

  user?: ExpertUser;

  created_at?: string;
  updated_at?: string;
}

/* =========================================================
   SCORE & RECOMMANDATIONS
========================================================= */

export interface ExpertScore {
  score: number;

  details: {
    experience: {
      years: number;
      score: number;
    };

    diversity: {
      count: number;
      score: number;
    };

    levels: {
      average: number;
      score: number;
    };

    availability: {
      status: AvailabilityStatus;
      score: number;
    };
  };
}

export interface ExpertRecommendation {
  expert: ExpertProfile;
  score: number;
  /** Moteur de score : similarité sémantique (ML) ou repli sur les règles. */
  scoringMethod?: 'SEMANTIC' | 'RULES';
  skillsMatch: {
    matched: number;
    required: number;
    score: number;
  };
  experienceMatch: {
    years: number;
    required: number;
    score: number;
  };
  availability: AvailabilityStatus;
  explanation: string;
}

/**
 * Projet éligible à une affectation d'expert (juré) : projet accepté dans une
 * cohorte ouverte ou en cours. Aucun score ici — le classement des experts est
 * calculé par le moteur de recommandation.
 */
export interface AssignableProject {
  project: {
    id: string;
    name: string;
    description?: string | null;
  };
  cohort: {
    id: string;
    name: string;
  } | null;
}

/* =========================================================
   ANNUAIRE (consultation par les incubateurs)
========================================================= */

export interface ExpertDirectoryFilters {
  q?: string;
  expertiseAreaId?: string;
  availability?: AvailabilityStatus;
  page?: number;
  limit?: number;
}

/** Page d'annuaire des experts (`GET /experts`). */
export type ExpertDirectoryPage = Paginated<ExpertProfile>;

/* =========================================================
   DTOs
========================================================= */

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

/* =========================================================
   UI TYPES
========================================================= */

export interface SelectedExpertise {
  id: string;

  areaId: string;

  areaName: string;

  level: ExpertiseLevel;

  yearsOfExperience: number;

  connectionId?: string;
}

/* =========================================================
   LABELS
========================================================= */

export const AVAILABILITY_LABELS: Record<
  AvailabilityStatus,
  string
> = {
  AVAILABLE: 'Disponible',
  BUSY: 'Occupé(e)',
  UNAVAILABLE: 'Indisponible',
};

export const LEVEL_LABELS: Record<
  ExpertiseLevel,
  string
> = {
  junior: 'Junior',
  intermediate: 'Intermédiaire',
  senior: 'Senior',
  expert: 'Expert',
};

/* =========================================================
   COLORS
========================================================= */

export const AVAILABILITY_BG_COLORS: Record<
  AvailabilityStatus,
  string
> = {
  AVAILABLE: 'bg-green-100 text-green-800',

  BUSY: 'bg-yellow-100 text-yellow-800',

  UNAVAILABLE: 'bg-red-100 text-red-800',
};

export const LEVEL_COLORS: Record<
  ExpertiseLevel,
  string
> = {
  junior: 'bg-blue-100 text-blue-800',

  intermediate: 'bg-green-100 text-green-800',

  senior: 'bg-yellow-100 text-yellow-800',

  expert: 'bg-purple-100 text-purple-800',
};

/* =========================================================
   OPTIONAL HELPERS
========================================================= */

export const EXPERTISE_LEVELS: ExpertiseLevel[] = [
  'junior',
  'intermediate',
  'senior',
  'expert',
];

export const AVAILABILITY_STATUSES: AvailabilityStatus[] = [
  'AVAILABLE',
  'BUSY',
  'UNAVAILABLE',
];