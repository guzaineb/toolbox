'use client';

import Link from 'next/link';
import { Users, Briefcase, Shield } from 'lucide-react';
import { Badge, Button, Card, CardHeader } from '@/components/shared/ui';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="mb-8">
        <h1 className="font-syne text-2xl font-extrabold text-ink">Administration</h1>
        <p className="text-ink3 mt-1">Gestion des experts et porteurs de projet</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/admin/experts">
          <Card className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all">
            <CardHeader icon={<Users size={13} />} title="Gestion des experts">
              <Shield size={14} className="text-ink3" />
            </CardHeader>
            <div className="px-[18px] pb-[18px]">
              <p className="text-[12px] text-ink3">
                Consultez et gérez les profils experts, leurs disponibilités et domaines d&apos;expertise.
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/project-owners">
          <Card className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all">
            <CardHeader icon={<Briefcase size={13} />} title="Porteurs de projet">
              <Shield size={14} className="text-ink3" />
            </CardHeader>
            <div className="px-[18px] pb-[18px]">
              <p className="text-[12px] text-ink3">
                Consultez les porteurs de projet inscrits, leurs compétences et expériences.
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
