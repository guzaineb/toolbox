/* =========================================================
   ENUMS
========================================================= */

export type CohortStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';

export type ParticipationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export type ParticipationOrigin = 'APPLICATION' | 'INVITATION';

export type CohortExpertRole = 'JURY' | 'COACH';

export type CohortExpertStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';

/* =========================================================
   BASE ENTITIES
========================================================= */

export interface Cohort {
  id: string;
  name: string;
  program?: string;
  description?: string;
  capacity?: number;
  current_participants: number;
  application_deadline?: string;
  start_date?: string;
  end_date?: string;
  status: CohortStatus;
  incubator_id?: string;
  created_at: string;
  updated_at: string;

  participations?: CohortParticipation[];
  experts?: CohortExpert[];
  incubator?: { id: string; name: string };
  _count?: { participations: number };
}

export interface CohortParticipation {
  id: string;
  cohort_id: string;
  project_id: string;
  status: ParticipationStatus;
  origin: ParticipationOrigin;
  applied_at: string;
  invited_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;

  cohort?: Cohort;
  project?: { id: string; name: string; description?: string; owner_id?: string };
}

export interface CohortExpert {
  id: string;
  cohort_id: string;
  expert_user_id: string;
  role: CohortExpertRole;
  status: CohortExpertStatus;
  assigned_by: string;
  assigned_at: string;
  invited_at?: string;
  responded_at?: string;

  expertUser?: {
    id: string;
    email: string;
    profile?: { first_name: string; last_name: string };
    expertProfile?: {
      headline?: string;
      availability_status?: string;
      expertiseConnections?: Array<{
        expertiseArea: { id: string; name: string };
      }>;
    };
  };
  cohort?: {
    id: string;
    name: string;
    description?: string;
    status: CohortStatus;
    capacity?: number;
    current_participants: number;
    application_deadline?: string;
    start_date?: string;
    end_date?: string;
    incubator?: { id: string; name: string };
    _count?: { participations: number };
  };
}

export interface Evaluation {
  id: string;
  project_id: string;
  jury_user_id: string;
  score: number;
  comment?: string;
  /** Statut renvoyé par le backend (DRAFT | SUBMITTED) — absent sur les anciennes réponses. */
  status?: 'DRAFT' | 'SUBMITTED';
  submitted_at?: string | null;
  template_id?: string | null;
  version?: number;
  created_at: string;
  updated_at: string;

  project?: { id: string; name: string; description?: string };
  juryUser?: {
    id: string;
    email: string;
    profile?: { first_name: string; last_name: string };
  };
}

/* =========================================================
   DTOs
========================================================= */

export interface CreateCohortDto {
  name: string;
  program?: string;
  description?: string;
  capacity?: number;
  application_deadline?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateCohortDto {
  name?: string;
  program?: string;
  description?: string;
  capacity?: number;
  application_deadline?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateCohortExpertDto {
  expertUserId: string;
  role: CohortExpertRole;
}

export interface UpdateCohortExpertDto {
  role?: CohortExpertRole;
  status?: CohortExpertStatus;
}

export interface CreateEvaluationDto {
  score: number;
  comment?: string;
}

export interface UpdateEvaluationDto {
  score?: number;
  comment?: string;
}

/* =========================================================
   LABELS & COLORS
========================================================= */

export const COHORT_STATUS_LABELS: Record<CohortStatus, string> = {
  DRAFT: 'Brouillon',
  OPEN: 'Ouverte',
  IN_PROGRESS: 'En cours',
  CLOSED: 'Clôturée',
  ARCHIVED: 'Archivée',
};

export const COHORT_STATUS_COLORS: Record<CohortStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
};

export const PARTICIPATION_STATUS_LABELS: Record<ParticipationStatus, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
  WITHDRAWN: 'Retirée',
};

export const PARTICIPATION_STATUS_COLORS: Record<ParticipationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800',
};

export const PARTICIPATION_ORIGIN_LABELS: Record<ParticipationOrigin, string> = {
  APPLICATION: 'Candidature',
  INVITATION: 'Invitation',
};

export const EXPERT_ROLE_LABELS: Record<CohortExpertRole, string> = {
  JURY: 'Jury',
  COACH: 'Coach',
};

export const EXPERT_ROLE_COLORS: Record<CohortExpertRole, string> = {
  JURY: 'bg-purple-100 text-purple-800',
  COACH: 'bg-blue-100 text-blue-800',
};

export const EXPERT_STATUS_LABELS: Record<CohortExpertStatus, string> = {
  PENDING: 'Invitation en attente',
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
};

export const EXPERT_STATUS_COLORS: Record<CohortExpertStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
};
