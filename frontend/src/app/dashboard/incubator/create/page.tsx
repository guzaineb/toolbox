

import { useForm } from 'react-hook-form';
import api from '../../../../services/api';
import { useRouter } from 'next/navigation';

export default function CreateIncubator() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await api.post('/incubators', data);
      router.push('/dashboard');
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Créer un incubateur</h1>
      <input {...register('name')} placeholder="Nom" required className="border p-2 w-full" />
      <input {...register('slug')} placeholder="Slug (unique)" required className="border p-2 w-full" />
      <textarea {...register('description')} placeholder="Description" className="border p-2 w-full" />
      <input {...register('email')} placeholder="Email" type="email" className="border p-2 w-full" />
      <input {...register('phone')} placeholder="Téléphone" className="border p-2 w-full" />
      <input {...register('website_url')} placeholder="Site web" className="border p-2 w-full" />
      <input {...register('address')} placeholder="Adresse" className="border p-2 w-full" />
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">Créer</button>
    </form>
  );
}