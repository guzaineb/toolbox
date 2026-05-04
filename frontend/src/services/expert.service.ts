
import api from './api';
import {
  ExpertProfile,
  CreateExpertDto,
  UpdateExpertDto,
  AddExpertiseDto,
  ExpertiseArea,
  ExpertScore,
  ProjectMatch,
  ExpertiseConnection,
} from '@/types/expert';

class ExpertService {
  private static instance: ExpertService;

  static getInstance(): ExpertService {
    if (!ExpertService.instance) {
      ExpertService.instance = new ExpertService();
    }
    return ExpertService.instance;
  }

  // ==================== PROFIL ====================

  async getMyProfile(): Promise<ExpertProfile | null> {
    try {
      const response = await api.get('/experts/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  async getExpertById(id: string): Promise<ExpertProfile> {
    const response = await api.get(`/experts/${id}`);
    return response.data;
  }

  async getAllExperts(filters?: {
    availability?: string;
    expertiseArea?: string;
    minYears?: number;
  }): Promise<ExpertProfile[]> {
    const params = new URLSearchParams();
    if (filters?.availability) params.append('availability', filters.availability);
    if (filters?.expertiseArea) params.append('expertiseArea', filters.expertiseArea);
    if (filters?.minYears) params.append('minYears', filters.minYears.toString());
    
    const response = await api.get(`/experts?${params.toString()}`);
    return response.data;
  }

  async createProfile(data: CreateExpertDto): Promise<ExpertProfile> {
    const response = await api.post('/experts', data);
    return response.data;
  }

  async updateProfile(data: UpdateExpertDto): Promise<ExpertProfile> {
    const response = await api.patch('/experts/me', data);
    return response.data;
  }

  async deleteProfile(): Promise<void> {
    await api.delete('/experts/me');
  }

  // ==================== EXPERTISES ====================

  async getAllExpertiseAreas(): Promise<ExpertiseArea[]> {
    const response = await api.get('/experts/expertise-areas');
    return response.data;
  }

  async getExpertiseAreasByCategory(): Promise<Record<string, ExpertiseArea[]>> {
    const response = await api.get('/experts/expertise-areas/categories');
    return response.data;
  }

  async getMyExpertises() {
    const response = await api.get('/experts/me/expertises');
    return response.data;
  }

  async addExpertise(dto: AddExpertiseDto): Promise<ExpertProfile> {
    const response = await api.post('/experts/me/expertises', dto);
    return response.data;
  }

  async addMultipleExpertises(expertises: AddExpertiseDto[]): Promise<ExpertProfile> {
    const response = await api.post('/experts/me/expertises/batch', { expertises });
    return response.data;
  }

   async updateExpertiseLevel(expertiseAreaId: string,level: string,years_of_experience?: number
  ): Promise<ExpertiseConnection> {
    const response = await api.patch(`/experts/me/expertises/${expertiseAreaId}`, {
      level,
      years_of_experience,
    });
    return response.data;
  }

  async removeExpertise(expertiseAreaId: string): Promise<void> {
    await api.delete(`/experts/me/expertises/${expertiseAreaId}`);
  }

  // ==================== IA / SCORING ====================

  async getMyScore(): Promise<ExpertScore> {
    const response = await api.get('/experts/me/score');
    return response.data;
  }

  async matchWithProject(requiredAreas: string[], minYearsExperience: number): Promise<ProjectMatch> {
    const response = await api.post('/experts/me/match-project', {
      requiredAreas,
      minYearsExperience,
    });
    return response.data;
  }

  async matchWithMultipleProjects(
    projects: Array<{ requiredAreas: string[]; minYearsExperience: number }>
  ): Promise<Array<{ project: any; matchPercentage: number; details: any }>> {
    const response = await api.post('/experts/me/match-projects-batch', { projects });
    return response.data;
  }

  // ==================== RECOMMANDATIONS ====================

  async getTopExperts(limit: number = 10, sortBy: 'score' | 'experience' | 'availability' = 'score') {
    const response = await api.get(`/experts/analytics/top-experts?limit=${limit}&sortBy=${sortBy}`);
    return response.data;
  }

  async getExpertiseStatistics() {
    const response = await api.get('/experts/analytics/expertise-stats');
    return response.data;
  }

  async recommendJury(projectId: string, limit: number = 3) {
    const response = await api.post('/experts/recommendations/jury', { projectId, limit });
    return response.data;
  }

  async recommendCoachs(cohortId: string, limit: number = 3, excludeIds: string[] = []) {
    const response = await api.post('/experts/recommendations/coachs', { cohortId, limit, excludeIds });
    return response.data;
  }
}

export const expertService = ExpertService.getInstance();