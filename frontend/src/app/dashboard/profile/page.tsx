"use client';

import { useAuth } from "@/hooks/useAuth';
import { useEffect, useState } from "react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user } = useAuth();
    const [editing, setEditing] = useState(false);

    if (!user) {
        return <div>Chargement...</div>;
    }

    return (
        <div className=\"max-w-2xl mx-auto p-6\">
            < div className =\"flex justify-between items-center mb-8\">
                < h1 className =\"text-3xl font-bold\">Mon Profil</h1>
                    < button onClick = {() => setEditing(!editing)
} className =\"bg-blue-500 text-white px-4 py-2 rounded-lg\">
{ editing ? 'Annuler' : 'Modifier' }
        </button >
      </div >

    <div className=\"bg-white rounded-xl shadow-sm border p-8\">
        < div className =\"grid grid-cols-1 md:grid-cols-2 gap-8\">
            < div >
            <h2 className=\"text-xl font-semibold mb-4\">Informations personnelles</h2>
                < p > <strong>Nom:</strong> { user.profile?.first_name } { user.profile?.last_name }</p >
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Téléphone:</strong> {user.profile?.phone}</p>
            <p><strong>Pays:</strong> {user.profile?.country}</p>
          </div >

    <div>
        <h2 className=\"text-xl font-semibold mb-4\">Rôles</h2>
{
    user.projectOwnerProfile && <div className=\"mb-4 p-3 bg-blue-50 rounded-lg\">Porteur de projet</div>}
    {
        user.expertProfile && <div className=\"mb-4 p-3 bg-green-50 rounded-lg\">Expert</div>}
        {
            user.incubatorMembers?.length > 0 && (
                <div className=\"p-3 bg-purple-50 rounded-lg\">
                    < strong > Membre incubateur</strong > ({ user.incubatorMembers.length })
              </div >
            )
        }
        <Link href=\"/dashboard/incubator/create\" className=\"text-blue-500 hover:underline mt-2 block\">
              Créer un incubateur
            </Link >
          </div >
        </div >

            { editing && (
                <div className=\"mt-8 pt-8 border-t\">
                    < h3 className =\"text-lg font-semibold mb-4\">Modifier le profil</h3>
        {/* Add form here */ }
        <button className=\"bg-green-500 text-white px-6 py-2 rounded-lg\">
        Sauvegarder
            </button >
          </div >
        )
    }
      </div >
    </div >
  );
}
