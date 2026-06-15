import api from './api';
import {
  Project, CreateProjectDto, UpdateProjectDto, ProjectStep,
  Review, CreateReviewDto, ProgressInfo, PorteurKPIs, IncubateurKPIs,
  AIChatResponse, BMCResponse, BusinessPlanResponse, EvaluationResponse,
  ScoreInfo, UpdateStepDto, ProjectDocument,
} from '@/types/project';

class ProjectService {
  private static instance: ProjectService;

  static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  // ── Projects ──
  async getAll(): Promise<Project[]> {
    const response = await api.get('/projects');
    return response.data;
  }

  async getOne(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  }

  async create(data: CreateProjectDto): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data;
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  }

  async updateStatus(id: string, status: string): Promise<Project> {
    const response = await api.patch(`/projects/${id}/status`, { status });
    return response.data;
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }

  async getProgress(id: string): Promise<ProgressInfo> {
    const response = await api.get(`/projects/${id}/progress`);
    return response.data;
  }

  // ── Steps ──
  async getSteps(projectId: string): Promise<ProjectStep[]> {
    const response = await api.get(`/projects/${projectId}/steps`);
    return response.data;
  }

  async getStep(projectId: string, stepNumber: number): Promise<ProjectStep> {
    const response = await api.get(`/projects/${projectId}/steps/${stepNumber}`);
    return response.data;
  }

  async updateStep(projectId: string, stepNumber: number, data: UpdateStepDto): Promise<ProjectStep> {
    const response = await api.patch(`/projects/${projectId}/steps/${stepNumber}`, data);
    return response.data;
  }

  async submitStep(projectId: string, stepNumber: number): Promise<ProjectStep> {
    const response = await api.post(`/projects/${projectId}/steps/${stepNumber}/submit`);
    return response.data;
  }

  // ── Documents ──
  async getDocuments(projectId: string): Promise<ProjectDocument[]> {
    const response = await api.get(`/projects/${projectId}/documents`);
    return response.data;
  }

  async uploadDocument(projectId: string, file: File, documentType: string, stepId?: string): Promise<ProjectDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    if (stepId) formData.append('step_id', stepId);
    const response = await api.post(`/projects/${projectId}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async verifyDocument(id: string, status: 'approved' | 'rejected', reason?: string): Promise<ProjectDocument> {
    const response = await api.patch(`/projects/${id}/documents/${id}/verify`, { status, reason });
    return response.data;
  }

  // ── Reviews ──
  async getReviews(projectId: string): Promise<Review[]> {
    const response = await api.get(`/projects/${projectId}/reviews`);
    return response.data;
  }

  async createReview(projectId: string, data: CreateReviewDto): Promise<Review> {
    const response = await api.post(`/projects/${projectId}/reviews`, data);
    return response.data;
  }

  async getScore(projectId: string): Promise<ScoreInfo> {
    const response = await api.get(`/projects/${projectId}/reviews/score`);
    return response.data;
  }

  // ── Progress / KPIs ──
  async getPorteurKPIs(): Promise<PorteurKPIs> {
    const response = await api.get('/progress/porteur');
    return response.data;
  }

  async getIncubateurKPIs(): Promise<IncubateurKPIs> {
    const response = await api.get('/progress/incubateur');
    return response.data;
  }

  async getProgressHistory(projectId: string): Promise<any[]> {
    const response = await api.get(`/progress/project/${projectId}/history`);
    return response.data;
  }

  // ── AI Assistant ──
  async chat(projectId: string, stepNumber: number, message: string, context: any): Promise<AIChatResponse> {
    const response = await api.post(`/ai-assistant/chat/${projectId}/${stepNumber}`, { message, context });
    return response.data;
  }

  async generateBMC(projectId: string, stepContent: any): Promise<BMCResponse> {
    const response = await api.post(`/ai-assistant/generate-bmc/${projectId}`, { stepContent });
    return response.data;
  }

  async generateBusinessPlan(projectId: string, allSteps: any[]): Promise<BusinessPlanResponse> {
    const response = await api.post(`/ai-assistant/generate-business-plan/${projectId}`, { allSteps });
    return response.data;
  }

  async evaluate(projectId: string, allSteps: any[]): Promise<EvaluationResponse> {
    const response = await api.post(`/ai-assistant/evaluate/${projectId}`, { allSteps });
    return response.data;
  }

  // ── Notifications ──
  async getNotifications(): Promise<any[]> {
    const response = await api.get('/notifications');
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }

  async markAsRead(id: string): Promise<any> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  }
}

export const projectService = ProjectService.getInstance();
