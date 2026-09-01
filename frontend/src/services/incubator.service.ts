import api from './api';
import {Incubator,CreateIncubatorDto,UpdateIncubatorDto,UpdateStatusDto,UpdateVerificationDto,IncubatorDashboard,IncubatorMember,IncubatorDocument,} from '@/types/incubator';

export interface AddMemberDto {
  user_id: string;
  role: string;
  job_title?: string;
}

export interface InviteMemberDto {
  email: string;
  role: string;
  job_title?: string;
}

export interface AcceptInviteDto {
  token: string;
}

class IncubatorService {
  private static instance: IncubatorService;

  static getInstance(): IncubatorService {
    if (!IncubatorService.instance) {
      IncubatorService.instance = new IncubatorService();
    }
    return IncubatorService.instance;
  }

  // ==================== INCUBATEURS ====================

  async create(data: CreateIncubatorDto): Promise<Incubator> {
    const response = await api.post('/incubators', data);
    return response.data;
  }

  async getAll(): Promise<Incubator[]> {
    const response = await api.get('/incubators');
    return response.data;
  }

  async getMyIncubators(): Promise<Incubator[]> {
    const response = await api.get('/incubators/my');
    return response.data;
  }

  async getOne(id: string): Promise<Incubator> {
    const response = await api.get(`/incubators/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateIncubatorDto): Promise<Incubator> {
    const response = await api.patch(`/incubators/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/incubators/${id}`);
    return response.data;
  }

  async updateStatus(id: string, data: UpdateStatusDto): Promise<Incubator> {
    const response = await api.patch(`/incubators/${id}/status`, data);
    return response.data;
  }

  async updateVerification(id: string, data: UpdateVerificationDto): Promise<Incubator> {
    const response = await api.patch(`/incubators/${id}/verification`, data);
    return response.data;
  }

  async getDashboard(id: string): Promise<IncubatorDashboard> {
    const response = await api.get(`/incubators/${id}/dashboard`);
    return response.data;
  }

  // ==================== MEMBRES ====================

  async getMembers(incubatorId: string): Promise<IncubatorMember[]> {
    const response = await api.get(`/incubators/${incubatorId}/members`);
    return response.data;
  }

  async addMember(incubatorId: string, data: AddMemberDto): Promise<IncubatorMember> {
    const response = await api.post(`/incubators/${incubatorId}/members`, data);
    return response.data;
  }

  async removeMember(incubatorId: string, memberId: string): Promise<{ message: string }> {
    const response = await api.delete(`/incubators/${incubatorId}/members/${memberId}`);
    return response.data;
  }

  // ==================== INVITATIONS ====================

  async inviteMember(incubatorId: string, data: InviteMemberDto): Promise<{ message: string; token?: string }> {
    const response = await api.post(`/incubators/${incubatorId}/members/invite`, data);
    return response.data;
  }

  async acceptInvite(incubatorId: string, token: string): Promise<{ message: string }> {
    const response = await api.post(`/incubators/${incubatorId}/members/accept`, { token });
    return response.data;
  }

  async declineInvite(incubatorId: string, token: string): Promise<{ message: string }> {
    const response = await api.post(`/incubators/${incubatorId}/members/decline`, { token });
    return response.data;
  }

  // ==================== DOCUMENTS ====================

  async getDocuments(incubatorId: string): Promise<IncubatorDocument[]> {
    const response = await api.get(`/incubators/${incubatorId}/documents`);
    return response.data;
  }

  async uploadDocument(incubatorId: string, formData: FormData): Promise<IncubatorDocument> {
    const response = await api.post(`/incubators/${incubatorId}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteDocument(incubatorId: string, documentId: string): Promise<{ message: string }> {
    const response = await api.delete(`/incubators/${incubatorId}/documents/${documentId}`);
    return response.data;
  }
}

export const incubatorService = IncubatorService.getInstance();