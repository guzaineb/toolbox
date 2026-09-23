import api from './api';
import type { Sector } from '@/types/reference';

class SectorService {
  private static instance: SectorService;

  static getInstance(): SectorService {
    if (!SectorService.instance) {
      SectorService.instance = new SectorService();
    }
    return SectorService.instance;
  }

  async getAll(): Promise<Sector[]> {
    const response = await api.get('/sectors');
    return response.data;
  }
}

export const sectorService = SectorService.getInstance();
