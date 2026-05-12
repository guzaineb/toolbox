'use client';

import { useEffect, useState } from 'react';
import { projectOwnerService } from '@/services/projectOwner.service';
import { ProjectOwnerProfile } from '@/types/projectOwner';
import { Badge, Button } from '@/components/shared/ui';
import Link from 'next/link';

export default function AdminProjectOwnersPage() {
  const [owners, setOwners] = useState<ProjectOwnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await projectOwnerService.getAllProjectOwners();
        setOwners(res.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOwners();
  }, []);

  if (loading) return <div className="p-8">Chargement des porteurs de projet...</div>;
  if (error) return <div className="p-8 text-red-600">Erreur : {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Porteurs de projet inscrits</h1>
      {owners.length === 0 ? (
        <p>Aucun porteur de projet pour le moment.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {owners.map(owner => (
            <div key={owner.id} className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">
                    {owner.user?.profile?.first_name} {owner.user?.profile?.last_name}
                  </h2>
                  <p className="text-sm text-gray-600">{owner.user?.email}</p>
                  <p className="text-sm mt-1">Statut : {owner.current_status || 'Non renseigné'}</p>
                  <p className="text-sm">Expérience entrepreneuriale : {owner.entrepreneurial_experience_level}/3</p>
                </div>
              </div>
              {owner.skills.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-medium">Compétences :</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {owner.skills.slice(0, 3).map(s => (
                      <Badge key={s.id} variant="secondary" >{s.skill_name}</Badge>
                    ))}
                    {owner.skills.length > 3 && <span className="text-xs">+{owner.skills.length - 3}</span>}
                  </div>
                </div>
              )}
              <Link href={`/dashboard/admin/project-owners/${owner.id}`} className="mt-3 inline-block text-sm text-blue-600">
                Voir détail →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}