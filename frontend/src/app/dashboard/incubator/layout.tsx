'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/RoleGuard';

export default function IncubatorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['incubator_membre']}>
      {children}
    </RoleGuard>
  );
}
