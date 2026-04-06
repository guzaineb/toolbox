'use client';

import { useEffect, useState } from 'react';
import api from '../../services/api';
import IncubatorCard from '../../components/IncubatorCard';
import Link from 'next/link';

export default function Dashboard() {
  const [incubators, setIncubators] = useState([]);

  useEffect(() => {
    api.get('/incubators').then(res => setIncubators(res.data));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes incubateurs</h1>
        <Link href="/dashboard/incubator/create" className="bg-green-500 text-white px-4 py-2 rounded">
          + Créer un incubateur
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incubators.map((inc: any) => (
          <IncubatorCard key={inc.id} incubator={inc} />
        ))}
      </div>
    </div>
  );
}