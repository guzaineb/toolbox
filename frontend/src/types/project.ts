export type ProjectStatus = 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export type StepStatus = 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface ProjectStep {
  id: string;
  project_id: string;
  step_number: number;
  title: string;
  description: string;
  content: Record<string, any>;
  sub_sections: Record<string, any>;
  status: StepStatus;
  score: number | null;
  validation_errors: string[] | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  user_id: string;
  user?: {
    id: string;
    email: string;
    profile?: {
      first_name: string;
      last_name: string;
    };
  };
  steps?: ProjectStep[];
  documents?: ProjectDocument[];
  reviews?: Review[];
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  document_type: string;
  file_url: string;
  step_id: string;
  version: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  uploaded_by_user_id: string;
  uploaded_at: string;
}

export interface Review {
  id: string;
  project_id: string;
  step_id: string;
  document_id: string;
  user_id: string;
  content: string;
  innovation_score: number;
  faisability_score: number;
  market_score: number;
  team_score: number;
  business_model_score: number;
  user?: {
    id: string;
    profile?: {
      first_name: string;
      last_name: string;
    };
  };
  created_at: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface CreateReviewDto {
  content: string;
  step_id?: string;
  document_id?: string;
  innovation_score?: number;
  faisability_score?: number;
  market_score?: number;
  team_score?: number;
  business_model_score?: number;
}

export interface UpdateStepDto {
  content?: Record<string, any>;
  sub_sections?: Record<string, any>;
  status?: StepStatus;
}

export interface ProgressInfo {
  percentage: number;
  completed: number;
  submitted: number;
  approved: number;
  rejected: number;
  in_progress: number;
  not_started: number;
  total: number;
  byStatus?: Record<string, number>;
}

export interface DetailedProjectStats {
  progress: ProgressInfo;
  history: any[];
  stepsStatus: { step_number: number; title: string; status: string; score: number | null }[];
}

export interface PorteurKPIs {
  total_projects: number;
  average_progress: number;
  total_documents: number;
  total_reviews: number;
  average_score: number;
}

export interface IncubateurKPIs {
  total_projects: number;
  average_progress: number;
  blocked_steps: number;
  ready_for_review: number;
}

export interface AIChatResponse {
  response: string;
}

export interface BMCResponse {
  bmc: Record<string, string>;
}

export interface BusinessPlanResponse {
  businessPlan: string;
}

export interface EvaluationResponse {
  score: number;
  coherence: number;
  maturity: number;
  completeness: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface ScoreInfo {
  average: number;
  criteria: Record<string, number>;
}

export const STEP_STATUS_LABELS: Record<StepStatus, string> = {
  not_started: 'Non commencée',
  in_progress: 'En cours',
  submitted: 'Soumise',
  approved: 'Approuvée',
  rejected: 'Rejetée',
};

export const STEP_STATUS_VARIANTS: Record<StepStatus, 'gray' | 'blue' | 'amber' | 'green' | 'red'> = {
  not_started: 'gray',
  in_progress: 'blue',
  submitted: 'amber',
  approved: 'green',
  rejected: 'red',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  submitted: 'Soumis',
  under_review: 'En révision',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: string;
  label?: string;
  snapshot?: Record<string, any>;
  changelog?: { field: string; old: any; new: any }[];
  created_by?: string;
  author?: { id: string; profile?: { first_name: string; last_name: string } };
  is_current: boolean;
  created_at: string;
}

export interface BmcBlocks {
  customer_segments: string;
  value_proposition: string;
  channels: string;
  customer_relations: string;
  revenue_streams: string;
  key_resources: string;
  key_activities: string;
  key_partners: string;
  cost_structure: string;
  environmental_impact?: string;
  social_impact?: string;
  circular_economy?: string;
  sdg_goals?: string;
}

export interface BmcSnapshot {
  id: string;
  project_id: string;
  version_id?: string;
  blocks: BmcBlocks;
  is_green: boolean;
  is_auto_generated: boolean;
  created_at: string;
}

export interface ProjectShare {
  id: string;
  project_id: string;
  share_token: string;
  created_by?: string;
  is_active: boolean;
  permissions: { can_view_bmc?: boolean; can_view_business_plan?: boolean; can_view_documents?: boolean; can_comment?: boolean };
  expires_at?: string;
  created_at: string;
}

export interface PhaseInfo {
  phaseNumber: number;
  name: string;
  description: string;
  steps: number[];
}

export const PHASES: PhaseInfo[] = [
  { phaseNumber: 1, name: 'Ébaucher et définir', description: 'Définissez les fondations de votre projet', steps: [1, 2, 3, 4, 5, 6] },
  { phaseNumber: 2, name: 'Construire', description: 'Construisez votre modèle économique', steps: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
  { phaseNumber: 3, name: 'Tester', description: 'Testez vos hypothèses sur le terrain', steps: [19] },
  { phaseNumber: 4, name: 'Mettre en œuvre', description: 'Planifiez et exécutez', steps: [20] },
  { phaseNumber: 5, name: 'Mesurer et améliorer', description: 'Suivez vos indicateurs de performance', steps: [21] },
];
