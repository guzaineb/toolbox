'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/RoleGuard';

export default function ProjectOwnerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['PROJECT_OWNER']}>
      {children}
    </RoleGuard>
  );
}
