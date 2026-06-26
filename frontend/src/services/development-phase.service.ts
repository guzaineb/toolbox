import api from './api';
import type { DevelopmentPhase } from '@/types/reference';

class DevelopmentPhaseService {
  private static instance: DevelopmentPhaseService;

  static getInstance(): DevelopmentPhaseService {
    if (!DevelopmentPhaseService.instance) {
      DevelopmentPhaseService.instance = new DevelopmentPhaseService();
    }
    return DevelopmentPhaseService.instance;
  }

  async getAll(): Promise<DevelopmentPhase[]> {
    const response = await api.get('/development-phases');
    return response.data;
  }
}

export const developmentPhaseService = DevelopmentPhaseService.getInstance();
