'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/components/RoleGuard';

export default function ProjectOwnerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['project_owner']}>
      {children}
    </RoleGuard>
  );
}
