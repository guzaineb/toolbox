'use client';

import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth(); // login fait déjà appel à /auth/login
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await login(data.email, data.password);
      // La redirection est gérée dans login()
    } catch (err) {
      alert("Identifiants incorrects");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();        // Empêche la soumission GET classique
        handleSubmit(onSubmit)(e); // Appelle notre fonction asynchrone
      }}
      method="post"                 // Pour sécurité supplémentaire
      className="max-w-md mx-auto mt-10 space-y-4"
    >
      <h1 className="text-2xl font-bold">Connexion</h1>
      <input {...register('email')} type="email" placeholder="Email" className="border p-2 w-full" required />
      <input {...register('password')} type="password" placeholder="Mot de passe" className="border p-2 w-full" required />
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">Se connecter</button>
    </form>
  );
}