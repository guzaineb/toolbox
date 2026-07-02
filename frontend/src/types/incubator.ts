export interface IncubatorMember {
  id: string;
  user_id: string;
  incubator_id: string;
  role: 'admin' | 'program_manager' | 'cohort_manager' | 'review_manager' | 'member' | 'viewer';
  job_title?: string;
  is_primary_contact: boolean;
  can_manage_members: boolean;
  can_manage_programs: boolean;
  can_manage_cohorts: boolean;
  status: 'active' | 'inactive';
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
  verification_status: 'pending' | 'approved' | 'rejected';
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
  verification_status: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'suspended';
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
  status: 'active' | 'suspended';
}

export interface UpdateVerificationDto {
  verification_status: 'approved' | 'rejected';
}