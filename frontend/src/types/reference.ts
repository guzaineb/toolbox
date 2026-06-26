export interface Sector {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface DevelopmentPhase {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
}
