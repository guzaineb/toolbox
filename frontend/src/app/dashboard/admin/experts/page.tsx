'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expertService } from '@/services/expert.service';
import { ExpertProfile } from '@/types/expert';
import { AvailabilityBadge } from '@/components/expert/AvailabilityBadge';
import { Search, Filter, Eye } from 'lucide-react';

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadExperts();
  }, [filter]);

  const loadExperts = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filter !== 'all') filters.availability = filter;
      const data = await expertService.getAllExperts(filters);
      setExperts(data);
    } catch (error) {
      console.error('Error loading experts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter(expert =>
    expert.headline.toLowerCase().includes(search.toLowerCase()) ||
    expert.organization?.toLowerCase().includes(search.toLowerCase()) ||
    expert.position?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des experts</h1>
        <p className="text-gray-600 mt-1">Administration des profils experts</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un expert..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg"
        >
          <option value="all">Tous les statuts</option>
          <option value="available">Disponibles</option>
          <option value="busy">Occupés</option>
          <option value="unavailable">Indisponibles</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Expert</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Poste</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Expertises</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExperts.map((expert) => (
                <tr key={expert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{expert.headline}</p>
                      <p className="text-sm text-gray-500">{expert.organization}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{expert.position || '-'}</td>
                  <td className="px-6 py-4">
                    <AvailabilityBadge status={expert.availability_status} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {expert.expertiseConnections?.slice(0, 3).map(conn => (
                        <span key={conn.id} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {conn.expertiseArea.name}
                        </span>
                      ))}
                      {expert.expertiseConnections && expert.expertiseConnections.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          +{expert.expertiseConnections.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/experts/${expert.id}`}>
                      <button className="p-2 text-gray-600 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}