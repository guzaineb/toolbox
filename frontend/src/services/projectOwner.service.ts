import { CreateExperienceDto, CreateSkillDto, ProjectOwnerExperience, ProjectOwnerProfile, ProjectOwnerSkill, UpdateProjectOwnerDto } from '@/types/projectOwner';
import api from './api';

export class ProjectOwnerService {
  private static instance: ProjectOwnerService;

  static getInstance(): ProjectOwnerService {
    if (!ProjectOwnerService.instance) {
      ProjectOwnerService.instance = new ProjectOwnerService();
    }
    return ProjectOwnerService.instance;
  }

  async getMyProfile(): Promise<ProjectOwnerProfile | null> {
    try {
      const response = await api.get('/project-owner/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }
  async updateProfile(data: UpdateProjectOwnerDto): Promise<ProjectOwnerProfile> {
    const response = await api.patch('/project-owner/me', data);
    return response.data;
  }
  async createProfile(data: UpdateProjectOwnerDto): Promise<ProjectOwnerProfile> {
    const response = await api.post('/project-owner', data);
    return response.data;
  }

  async addSkill(data: CreateSkillDto): Promise<ProjectOwnerSkill> {
    const response = await api.post('/project-owner/skills', data);
    return response.data;
  }

  async getSkills(): Promise<ProjectOwnerSkill[]> {
    const response = await api.get('/project-owner/skills');
    return response.data;
  }

  async deleteSkill(skillId: string): Promise<void> {
    await api.delete(`/project-owner/skills/${skillId}`);
  }

  async addExperience(data: CreateExperienceDto): Promise<ProjectOwnerExperience> {
    const response = await api.post('/project-owner/experiences', data);
    return response.data;
  }

  async getExperiences(): Promise<ProjectOwnerExperience[]> {
    const response = await api.get('/project-owner/experiences');
    return response.data;
  }

  async deleteExperience(expId: string): Promise<void> {
    await api.delete(`/project-owner/experiences/${expId}`);
  }

  // Admin
  async getAllProjectOwners(page = 1, limit = 20): Promise<{ data: ProjectOwnerProfile[]; total: number; page: number; limit: number; totalPages: number }> {
    const response = await api.get(`/project-owner/admin/all?page=${page}&limit=${limit}`);
    return response.data;
  }
}

export const projectOwnerService = ProjectOwnerService.getInstance();