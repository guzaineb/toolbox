'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../../services/api';
import Link from 'next/link';

export default function IncubatorDetail() {
  const { id } = useParams();
  const [incubator, setIncubator] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/incubators/${id}`).then(res => setIncubator(res.data));
    }
  }, [id]);

  if (!incubator) return <div>Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">{incubator.name}</h1>
      <p className="text-gray-600">{incubator.description}</p>
      <p>Statut vérification: {incubator.verification_status}</p>

      <div className="mt-6 flex space-x-4">
        <Link href={`/dashboard/members/${id}`} className="bg-gray-200 px-4 py-2 rounded">Gérer les membres</Link>
        <Link href={`/dashboard/documents/${id}`} className="bg-gray-200 px-4 py-2 rounded">Documents</Link>
      </div>

      <h2 className="text-xl font-bold mt-8">Membres</h2>
      <ul className="list-disc pl-5">
        {incubator.members?.map((m: any) => (
          <li key={m.id}>{m.user?.profile?.first_name} {m.user?.profile?.last_name} – {m.role}</li>
        ))}
      </ul>
    </div>
  );
}