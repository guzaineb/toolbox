'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../../services/api';
import { useForm } from 'react-hook-form';

export default function ManageMembers() {
  const { incubatorId } = useParams();
  const [members, setMembers] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const fetchMembers = async () => {
    const res = await api.get(`/incubators/${incubatorId}/members`);
    setMembers(res.data);
  };

  useEffect(() => {
    if (incubatorId) fetchMembers();
  }, [incubatorId]);

  const onAddMember = async (data: any) => {
    await api.post(`/incubators/${incubatorId}/members`, data);
    reset();
    fetchMembers();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Gestion des membres</h1>
      <form onSubmit={handleSubmit(onAddMember)} className="my-6 space-y-2">
        <input {...register('userId')} placeholder="ID de l'utilisateur" required className="border p-2 w-full" />
        <select {...register('role')} className="border p-2 w-full">
          <option value="member">Membre</option>
          <option value="program_manager">Responsable programme</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Ajouter</button>
      </form>
      <ul>
        {members.map((m: any) => (
          <li key={m.id} className="border-b py-2">{m.user?.email} – {m.role}</li>
        ))}
      </ul>
    </div>
  );
}