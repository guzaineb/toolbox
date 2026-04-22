// ── Types partagés : Module Expert ────────────────────────────────────────────

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

export interface ExpertiseArea {
  id: string;
  name: string;
  category: string;
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
  expertiseAreas: ExpertiseArea[];
  user?: {
    id: string;
    email: string;
    profile?: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
      city?: string;
      country?: string;
    };
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

export interface UpdateExpertDto extends Partial<CreateExpertDto> {
  availability_status?: AvailabilityStatus;
}

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Disponible',
  busy: 'Occupé',
  unavailable: 'Non disponible',
};

export const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  available: '#16a34a',
  busy: '#d97706',
  unavailable: '#dc2626',
};
