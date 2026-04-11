'use client';

import { useEffect, useState } from 'react';
import api from '../../services/api';
import IncubatorCard from '../../components/IncubatorCard';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [incubators, setIncubators] = useState([]);
  const [loadingIncubators, setLoadingIncubators] = useState(true);

  useEffect(() => {
    if (user && user?.incubatorMembers?.length > 0) {
      api.get(`/incubators/my`)
        .then(res => setIncubators(res.data))
        .finally(() => setLoadingIncubators(false));
    } else {
      setLoadingIncubators(false);
    }
  }, [user]);

  // ✅ Vérification stricte du chargement
  if (authLoading || loadingIncubators) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // ✅ Vérification que user existe avant tout rendu
  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Session expirée</h2>
        <p className="text-xl text-gray-600 mb-8">
          Veuillez vous reconnecter pour accéder à votre tableau de bord.
        </p>
        <Link 
          href="/login" 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  // ✅ Maintenant user est garanti non-null, on peut accéder à ses propriétés en toute sécurité
  const role = user.projectOwnerProfile ? 'Porteur de projet' :
    user.expertProfile ? 'Expert' :
    user.incubatorMembers?.length > 0 ? 'Membre incubateur' : 'Membre';

  // ✅ Valeurs par défaut pour éviter les undefined
  const firstName = user.profile?.first_name || '';
  const lastName = user.profile?.last_name || '';
  const firstInitial = firstName.charAt(0) || '?';
  const lastInitial = lastName.charAt(0) || '?';
  const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';
  const userBio = user.profile?.bio || 'Ajoutez une bio pour vous présenter.';

  return (
    <div>
      {/* Profile Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-xl mb-8 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {firstInitial}{lastInitial}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{fullName}</h2>
                <p className="text-blue-100 text-lg mt-1">{role}</p>
                <p className="text-blue-50 mt-2">{userBio}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/dashboard/profile" 
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-medium transition-all text-center"
              >
                Compléter mon profil
              </Link>
              {user.incubatorMembers && user.incubatorMembers.length > 0 && (
                <Link 
                  href="/dashboard/incubator" 
                  className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-medium transition-all text-center"
                >
                  Gérer incubateurs ({user.incubatorMembers.length})
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Statut vérification</h3>
          <div className="text-3xl font-bold text-green-600">
            {user.is_verified ? 'Vérifié' : 'Non vérifié'}
          </div>
          <p className="text-gray-500 mt-1">
            {user.is_verified ? 'Compte vérifié' : 'Vérifiez votre compte pour plus de visibilité'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Incubateurs</h3>
          <div className="text-3xl font-bold text-blue-600">
            {user.incubatorMembers?.length || 0}
          </div>
          <p className="text-gray-500 mt-1">Membre actif</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rôle actif</h3>
          <p className="text-2xl font-bold capitalize">{role}</p>
          <p className="text-gray-500 mt-1">Sur la plateforme</p>
        </div>
      </div>

      {/* Incubators Section */}
      {user.incubatorMembers && user.incubatorMembers.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes incubateurs</h2>
            <Link 
              href="/dashboard/incubator/create" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              + Nouveau incubateur
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {incubators.map((inc: any) => (
              <IncubatorCard key={inc.id} incubator={inc} />
            ))}
            {incubators.length === 0 && (
              <div className="col-span-full bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun incubateur</h3>
                <p className="text-gray-500 mb-6">Commencez par créer votre premier incubateur</p>
                <Link 
                  href="/dashboard/incubator/create" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block"
                >
                  Créer mon incubateur
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {(!user.incubatorMembers || user.incubatorMembers.length === 0) && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Bienvenue sur ProjectStruct !</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complétez votre profil {role.toLowerCase()} pour accéder à toutes les fonctionnalités de la plateforme.
          </p>
          <Link 
            href="/dashboard/profile" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all inline-block"
          >
            Compléter mon profil
          </Link>
        </div>
      )}
    </div>
  );
}