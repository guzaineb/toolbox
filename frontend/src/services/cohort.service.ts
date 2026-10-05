import api from './api';
import {
  Cohort,
  CohortParticipation,
  CohortExpert,
  Evaluation,
  CreateCohortDto,
  UpdateCohortDto,
  CreateCohortExpertDto,
  UpdateCohortExpertDto,
  CreateEvaluationDto,
  UpdateEvaluationDto,
} from '@/types/cohort';

class CohortService {
  private static instance: CohortService;

  static getInstance(): CohortService {
    if (!CohortService.instance) {
      CohortService.instance = new CohortService();
    }
    return CohortService.instance;
  }

  // ==================== SEARCH ====================

  async searchProjects(query: string): Promise<Array<{ id: string; name: string; description?: string; owner_id: string }>> {
    if (!query.trim()) return [];
    const response = await api.get(`/projects/search?q=${encodeURIComponent(query.trim())}`);
    return response.data;
  }

  async searchExperts(query: string): Promise<Array<{
    id: string;
    email: string;
    profile?: { first_name: string; last_name: string };
    expertProfile?: { headline?: string; availability_status?: string };
  }>> {
    if (!query.trim()) return [];
    const response = await api.get(`/experts/search?q=${encodeURIComponent(query.trim())}`);
    return response.data;
  }

  // ==================== COHORTS ====================

  async getOpenCohorts(): Promise<Cohort[]> {
    const response = await api.get('/cohorts/open');
    return response.data;
  }

  async getAvailableCohorts(): Promise<Cohort[]> {
    const response = await api.get('/cohorts/available');
    return response.data;
  }

  async getMyCohorts(): Promise<CohortExpert[] | CohortParticipation[]> {
    const response = await api.get('/cohorts/my');
    return response.data;
  }

  async getCohortById(id: string): Promise<Cohort> {
    const response = await api.get(`/cohorts/${id}`);
    return response.data;
  }

  async getIncubatorCohorts(incubatorId: string): Promise<Cohort[]> {
    const response = await api.get(`/incubators/${incubatorId}/cohorts`);
    return response.data;
  }

  async createCohort(incubatorId: string, dto: CreateCohortDto): Promise<Cohort> {
    const response = await api.post(`/incubators/${incubatorId}/cohorts`, dto);
    return response.data;
  }

  async updateCohort(id: string, dto: UpdateCohortDto): Promise<Cohort> {
    const response = await api.patch(`/cohorts/${id}`, dto);
    return response.data;
  }

  async publishCohort(id: string): Promise<Cohort> {
    const response = await api.post(`/cohorts/${id}/publish`);
    return response.data;
  }

  async startCohort(id: string): Promise<Cohort> {
    const response = await api.post(`/cohorts/${id}/start`);
    return response.data;
  }

  async closeCohort(id: string): Promise<Cohort> {
    const response = await api.post(`/cohorts/${id}/close`);
    return response.data;
  }

  async archiveCohort(id: string): Promise<Cohort> {
    const response = await api.post(`/cohorts/${id}/archive`);
    return response.data;
  }

  async getCohortProgress(id: string) {
    const response = await api.get(`/cohorts/${id}/progress`);
    return response.data;
  }

  async getCoachingProjects(cohortId: string): Promise<Array<{
    project: { id: string; name: string; description?: string; owner_id: string };
    assignment: { id: string; role: string; status: string } | null;
    cohort_participation: { status: string; applied_at: string };
    stats: {
      sessions_count: number;
      last_session_at: string | null;
      next_session_at: string | null;
      recommendations_count: number;
      actions_pending: number;
      actions_total: number;
    };
  }>> {
    const response = await api.get(`/cohorts/${cohortId}/coaching-projects`);
    return response.data;
  }

  // ==================== PARTICIPATIONS ====================

  async applyToCohort(cohortId: string, projectId: string): Promise<CohortParticipation> {
    const response = await api.post(`/cohorts/${cohortId}/apply`, { projectId });
    return response.data;
  }

  async inviteToCohort(cohortId: string, projectId: string): Promise<CohortParticipation> {
    const response = await api.post(`/cohorts/${cohortId}/invite`, { projectId });
    return response.data;
  }

  async acceptParticipation(id: string): Promise<CohortParticipation> {
    const response = await api.post(`/participations/${id}/accept`);
    return response.data;
  }

  async rejectParticipation(id: string): Promise<CohortParticipation> {
    const response = await api.post(`/participations/${id}/reject`);
    return response.data;
  }

  async withdrawParticipation(id: string): Promise<CohortParticipation> {
    const response = await api.post(`/participations/${id}/withdraw`);
    return response.data;
  }

  async getCohortParticipations(cohortId: string): Promise<CohortParticipation[]> {
    const response = await api.get(`/cohorts/${cohortId}/participations`);
    return response.data;
  }

  async getProjectParticipations(projectId: string): Promise<CohortParticipation[]> {
    const response = await api.get(`/projects/${projectId}/participations`);
    return response.data;
  }

  async getParticipationById(id: string): Promise<CohortParticipation> {
    const response = await api.get(`/participations/${id}`);
    return response.data;
  }

  // ==================== COHORT EXPERTS ====================

  async assignExpert(cohortId: string, dto: CreateCohortExpertDto): Promise<CohortExpert> {
    const response = await api.post(`/cohorts/${cohortId}/experts`, dto);
    return response.data;
  }

  async getCohortExperts(
    cohortId: string,
    filters?: { role?: string; status?: string },
  ): Promise<CohortExpert[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/cohorts/${cohortId}/experts${query}`);
    return response.data;
  }

  async getAvailableExperts(
    cohortId: string,
    filters?: { expertiseAreaId?: string; availability?: string },
  ) {
    const params = new URLSearchParams();
    if (filters?.expertiseAreaId) params.append('expertiseAreaId', filters.expertiseAreaId);
    if (filters?.availability) params.append('availability', filters.availability);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/cohorts/${cohortId}/experts/available${query}`);
    return response.data;
  }

  async updateCohortExpert(id: string, dto: UpdateCohortExpertDto): Promise<CohortExpert> {
    const response = await api.patch(`/cohort-experts/${id}`, dto);
    return response.data;
  }

  async deactivateCohortExpert(id: string): Promise<CohortExpert> {
    const response = await api.delete(`/cohort-experts/${id}`);
    return response.data;
  }

  // Expert invitations / applications
  async inviteExpert(cohortId: string, dto: { expertUserId: string; role: string }): Promise<CohortExpert> {
    const response = await api.post(`/cohorts/${cohortId}/experts/invite`, dto);
    return response.data;
  }

  async applyAsExpert(cohortId: string, dto: { role: string }): Promise<CohortExpert> {
    const response = await api.post(`/cohorts/${cohortId}/experts/apply`, dto);
    return response.data;
  }

  async acceptExpertInvitation(id: string): Promise<CohortExpert> {
    const response = await api.post(`/cohort-experts/${id}/accept-invitation`);
    return response.data;
  }

  async rejectExpertInvitation(id: string): Promise<CohortExpert> {
    const response = await api.post(`/cohort-experts/${id}/reject-invitation`);
    return response.data;
  }

  // ==================== EVALUATIONS ====================

  async createEvaluation(projectId: string, dto: CreateEvaluationDto): Promise<Evaluation> {
    const response = await api.post(`/projects/${projectId}/evaluations`, dto);
    return response.data;
  }

  async updateEvaluation(id: string, dto: UpdateEvaluationDto): Promise<Evaluation> {
    const response = await api.patch(`/evaluations/${id}`, dto);
    return response.data;
  }

  async getEvaluationById(id: string): Promise<Evaluation> {
    const response = await api.get(`/evaluations/${id}`);
    return response.data;
  }

  async getProjectEvaluations(projectId: string): Promise<Evaluation[]> {
    const response = await api.get(`/projects/${projectId}/evaluations`);
    return response.data;
  }

  async getCohortEvaluations(cohortId: string): Promise<Evaluation[]> {
    const response = await api.get(`/cohorts/${cohortId}/evaluations`);
    return response.data;
  }

  async getMyEvaluations(): Promise<Evaluation[]> {
    const response = await api.get('/experts/me/evaluations');
    return response.data;
  }
}

export const cohortService = CohortService.getInstance();
