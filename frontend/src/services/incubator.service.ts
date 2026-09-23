import api from './api';
import {Incubator,CreateIncubatorDto,UpdateIncubatorDto,UpdateStatusDto,UpdateVerificationDto,} from '@/types/incubator';

class IncubatorService {
  private static instance: IncubatorService;

  static getInstance(): IncubatorService {
    if (!IncubatorService.instance) {
      IncubatorService.instance = new IncubatorService();
    }
    return IncubatorService.instance;
  }

  // Créer un incubateur
  async create(data: CreateIncubatorDto): Promise<Incubator> {
    const response = await api.post('/incubators', data);
    return response.data;
  }

  // Liste de tous les incubateurs (public)
  async getAll(): Promise<Incubator[]> {
    const response = await api.get('/incubators');
    return response.data;
  }

  // Liste des incubateurs dont l'utilisateur est membre
  async getMyIncubators(): Promise<Incubator[]> {
    const response = await api.get('/incubators/my');
    return response.data;
  }

  // Détail d'un incubateur par ID
  async getOne(id: string): Promise<Incubator> {
    const response = await api.get(`/incubators/${id}`);
    return response.data;
  }

  // Mettre à jour un incubateur
  async update(id: string, data: UpdateIncubatorDto): Promise<Incubator> {
    const response = await api.patch(`/incubators/${id}`, data);
    return response.data;
  }

  // Supprimer un incubateur
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/incubators/${id}`);
    return response.data;
  }

  // Changer le statut (actif / suspendu)
  async updateStatus(id: string, data: UpdateStatusDto): Promise<Incubator> {
    const response = await api.patch(`/incubators/${id}/status`, data);
    return response.data;
  }

  // Changer le statut de vérification (approuvé / rejeté)
  async updateVerification(id: string, data: UpdateVerificationDto): Promise<Incubator> {
    const response = await api.patch(`/incubators/${id}/verification`, data);
    return response.data;
  }
}

export const incubatorService = IncubatorService.getInstance();