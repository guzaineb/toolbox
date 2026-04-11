'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../../services/api';

export default function MembersPage() {
  const { incubatorId } = useParams();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (incubatorId) {
      api.get(`/incubators/${incubatorId}/members`).then(res => setMembers(res.data));
    }
  }, [incubatorId]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des membres</h1>
      <div className="bg-white rounded-lg shadow">
        {members.map((member: any) => (
          <div key={member.id} className="border-b p-4">
            <p className="font-semibold">{member.user?.profile?.first_name} {member.user?.profile?.last_name}</p>
            <p className="text-sm text-gray-600">Rôle: {member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}