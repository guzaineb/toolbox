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
  total: number;
  byStatus?: Record<string, number>;
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
