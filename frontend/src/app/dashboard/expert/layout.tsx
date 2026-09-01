'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/RoleGuard';

export default function ExpertLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['EXPERT']}>
      {children}
    </RoleGuard>
  );
}
