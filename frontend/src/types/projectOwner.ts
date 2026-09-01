// types/projectOwner.ts
export interface ProjectOwnerSkill {
  id: string;
  skill_name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at?: Date;
}

export interface ProjectOwnerExperience {
  id: string;
  title: string;
  organization: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_at?: Date;
}

export interface ProjectOwnerProfile {
  id: string;
  user_id?: string;
  current_status?: string;
  education_level?: string;
  field_of_study?: string;
  occupation?: string;
  linkedin_url?: string;
  entrepreneurial_experience_level: number;
  has_previous_startup: boolean;
  skills: ProjectOwnerSkill[];
  experiences: ProjectOwnerExperience[];
  user?: {
    id: string;
    email: string;
    profile?: {
      first_name: string;
      last_name: string;
    };
  };
  created_at?: Date;
  updated_at?: Date;
}

export interface UpdateProjectOwnerDto {
  current_status?: string;
  education_level?: string;
  field_of_study?: string;
  occupation?: string;
  entrepreneurial_experience_level?: number;
  has_previous_startup?: boolean;
  linkedin_url?: string;
}

export interface CreateSkillDto {
  skill_name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface CreateExperienceDto {
  title: string;
  organization: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}