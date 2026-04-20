'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Badge, Button, Card, StatBox } from '@/components/shared/ui';

interface Incubator {
  id: string;
  name: string;
  slug: string;
  city?: string;
  country?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'suspended';
  members?: { id: string }[];
  documents?: { id: string; verification_status: string }[];
}

const VERIFICATION_LABEL: Record<string, string> = {
  pending: 'En attente de validation',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};
const VERIFICATION_VARIANT: Record<string, 'amber' | 'green' | 'red'> = {
  pending: 'amber',
  approved: 'green',
  rejected: 'red',
};

export default function IncubatorListPage() {
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/incubators/my')
      .then((res) => setIncubators(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-64 bg-border rounded" />
          <div className="h-4 w-48 bg-border rounded" />
          <div className="h-24 bg-border rounded mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[800px]">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-[26px]">Incubateurs</h1>
        <Link href="/dashboard/incubator/create">
          <Button variant="primary" className="text-[12px]">+ Créer un incubateur</Button>
        </Link>
      </div>
      <p className="text-[13px] text-text-2 mb-7">
        Gérez vos structures d'accompagnement
      </p>

      {incubators.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-3xl mb-3">🏢</div>
          <p className="text-[14px] font-medium mb-1">Aucun incubateur</p>
          <p className="text-[13px] text-text-2 mb-5">
            Créez votre premier incubateur pour commencer.
          </p>
          <Link href="/dashboard/incubator/create">
            <Button variant="primary">+ Créer un incubateur</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {incubators.map((inc) => {
            const approvedDocs =
              inc.documents?.filter((d) => d.verification_status === 'approved').length ?? 0;
            const totalDocs = inc.documents?.length ?? 0;
            const foundationYear = '—';

            return (
              <Card key={inc.id} className="flex items-center gap-[14px]">
                <div className="w-14 h-14 rounded-[10px] bg-[#fdf0ec] text-[#8a3a1a] flex items-center justify-center text-[20px] flex-shrink-0">
                  🏢
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-semibold truncate">{inc.name}</div>
                  <div className="text-[12px] text-text-2">
                    {inc.slug}
                    {inc.city ? ` · ${inc.city}` : ''}
                    {inc.country ? `, ${inc.country}` : ''}
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge variant={VERIFICATION_VARIANT[inc.verification_status] ?? 'amber'}>
                      {VERIFICATION_LABEL[inc.verification_status] ?? inc.verification_status}
                    </Badge>
                    <Badge variant={inc.status === 'active' ? 'blue' : 'gray'}>
                      {inc.status === 'active' ? 'Actif' : 'Suspendu'}
                    </Badge>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="hidden sm:flex gap-4 text-center mr-2">
                  <div>
                    <div className="text-[16px] font-semibold">{inc.members?.length ?? 0}</div>
                    <div className="text-[10px] text-text-2">Membres</div>
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold">
                      {approvedDocs}/{totalDocs}
                    </div>
                    <div className="text-[10px] text-text-2">Docs validés</div>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  <Link href={`/dashboard/incubator/${inc.id}`}>
                    <Button className="text-[12px]">Gérer</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}