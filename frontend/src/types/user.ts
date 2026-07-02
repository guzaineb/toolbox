
export type UserRole =
  | 'admin'
  | 'expert'
  | 'project_owner'
  | 'incubator_membre';

 export interface Incubator {
  id: string;
  name: string;
  city?: string;
  country?: string;
  description?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  members?: { id: string; role: string; status: string; user?: { profile?: { first_name: string; last_name: string } } }[];
  documents?: { id: string; verification_status: string; document_type: string }[];
}
