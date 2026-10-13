
import api from './api';
import {
  ExpertProfile,
  CreateExpertDto,
  UpdateExpertDto,
  AddExpertiseDto,
  ExpertiseArea,
  ExpertScore,
  ExpertRecommendation,
  AssignableProject,
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
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status
      if (status === 404) return null;
      throw error;
    }
  }

  async getExpertById(id: string): Promise<ExpertProfile> {
    const response = await api.get(`/experts/${id}`);
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

  async updateExpertiseLevel(expertiseAreaId: string,level: string,years_of_experience?: number): Promise<ExpertProfile> {
  const response = await api.patch(`/experts/me/expertises/${expertiseAreaId}`, {
    level,
    years_of_experience,
  });
  return response.data;
}

  async removeExpertise(expertiseAreaId: string): Promise<void> {
    await api.delete(`/experts/me/expertises/${expertiseAreaId}`);
  }

  // ==================== SCORE ====================

  async getMyScore(): Promise<ExpertScore> {
    const response = await api.get('/experts/me/score');
    return response.data;
  }

  // ==================== AFFECTATION & RECOMMANDATIONS ====================

  /**
   * Projets éligibles à une affectation de juré (cohortes ouvertes ou en
   * cours). Liste brute : le classement des experts est fait au moment de la
   * recommandation.
   */
  async getAssignableProjects(limit: number = 50): Promise<AssignableProject[]> {
    const response = await api.get('/experts/me/assignable-projects', {
      params: { limit },
    });
    return response.data;
  }

  async assignToProject(
    projectId: string,
    expertUserId: string,
    role: 'COACH' | 'JURY',
  ): Promise<{ id: string }> {
    const response = await api.post(`/projects/${projectId}/assignments`, {
      expertUserId,
      role,
    });
    return response.data;
  }

  // ==================== RECOMMANDATIONS ====================

  async recommendJury(projectId: string, limit: number = 3): Promise<ExpertRecommendation[]> {
    const response = await api.post('/experts/recommendations/jury', { projectId, limit });
    return response.data;
  }

  async recommendCoachs(cohortId: string, limit: number = 3, excludeIds: string[] = []): Promise<ExpertRecommendation[]> {
    const response = await api.post('/experts/recommendations/coachs', { cohortId, limit, excludeIds });
    return response.data;
  }
}

export const expertService = ExpertService.getInstance();