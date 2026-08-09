export interface IncubatorMember {
  id: string;
  user_id: string;
  incubator_id: string;
  role: 'ADMIN' | 'PROGRAM_MANAGER' | 'COHORT_MANAGER' | 'REVIEW_MANAGER' | 'MEMBER' | 'VIEWER';
  job_title?: string;
  is_primary_contact: boolean;
  can_manage_members: boolean;
  can_manage_programs: boolean;
  can_manage_cohorts: boolean;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  user?: {
    id: string;
    email: string;
    profile?: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  };
}

export interface IncubatorDocument {
  id: string;
  document_type: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  file_url: string;
  uploaded_at: string;
}

export interface Incubator {
  id: string;
  name: string;
  legal_name?: string;
  slug: string;
  description?: string;
  foundation_date?: string;
  organization_type?: string;
  registration_number?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  address?: string;
  country?: string;
  city?: string;
  logo_url?: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'ACTIVE' | 'SUSPENDED';
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  members?: IncubatorMember[];
  documents?: IncubatorDocument[];
}

export interface CreateIncubatorDto {
  name: string;
  legal_name?: string;
  slug: string;
  description?: string;
  foundation_date?: string;
  organization_type?: string;
  registration_number?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  address?: string;
  country?: string;
  city?: string;
}

export type UpdateIncubatorDto = Partial<CreateIncubatorDto>;

export interface UpdateStatusDto {
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface UpdateVerificationDto {
  verification_status: 'APPROVED' | 'REJECTED';
}

export interface IncubatorDashboard {
  cohorts: {
    total: number;
    open: number;
    in_progress: number;
    archived: number;
    averageFillRate: number;
  };
  participations: {
    total: number;
    acceptanceRate: number;
    statusCounts: {
      PENDING: number;
      ACCEPTED: number;
      REJECTED: number;
      WITHDRAWN: number;
    };
  };
  experts: {
    total: number;
    jury: number;
    coach: number;
  };
  averageDecisionDelay: number;
  activeProjects: number;
  evaluations: number;
  coachings: number;
}