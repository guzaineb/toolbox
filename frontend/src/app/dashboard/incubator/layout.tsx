'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/RoleGuard';

export default function IncubatorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['INCUBATOR_MEMBER']}>
      {children}
    </RoleGuard>
  );
}
