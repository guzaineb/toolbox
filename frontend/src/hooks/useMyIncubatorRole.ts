// hooks/useMyIncubatorRole.ts
import { useEffect, useState } from 'react';
import api from '@/services/api';

interface MyRole {
  id: string;
  role: string;
  can_manage_members: boolean;
  can_manage_programs: boolean;
  can_manage_cohorts: boolean;
  status: string;
}

export function useMyIncubatorRole(incubatorId: string | undefined) {
  const [myRole, setMyRole] = useState<MyRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!incubatorId) return;
    api.get(`/incubators/${incubatorId}/members/me`)
      .then(res => setMyRole(res.data))
      .catch(() => setMyRole(null))
      .finally(() => setLoading(false));
  }, [incubatorId]);

  const isAdmin = myRole?.role === 'admin';
  const canManageMembers = isAdmin || myRole?.can_manage_members;

  return { myRole, loading, isAdmin, canManageMembers };
}