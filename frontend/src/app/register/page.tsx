'use client';

import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { useRouter } from 'next/navigation';

export default function Register() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await api.post('/users/register', data);
      router.push('/login');
    } catch (err) {
      alert("Erreur d'inscription");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // ← empêche explicitement le comportement par défaut
        handleSubmit(onSubmit)(e);
      }}
      method="post"        // ← force la méthode POST
      className="max-w-md mx-auto mt-10 space-y-4"
    >
      <h1 className="text-2xl font-bold">Inscription</h1>
      <input {...register('email')} type="email" placeholder="Email" className="border p-2 w-full" required />
      <input {...register('password')} type="password" placeholder="Mot de passe" className="border p-2 w-full" required />
      <input {...register('first_name')} placeholder="Prénom" className="border p-2 w-full" required />
      <input {...register('last_name')} placeholder="Nom" className="border p-2 w-full" required />
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">S'inscrire</button>
    </form>
  );
}