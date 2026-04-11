'use client';

import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { useRouter } from 'next/navigation';

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

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
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }}
      className="max-w-md mx-auto mt-10 space-y-4"
    >
      <h1 className="text-2xl font-bold">Inscription</h1>

      {/* Email */}
      <input
        {...register('email', {
          required: "Email est obligatoire",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Format d'email invalide"
          }
        })}
        type="email"
        placeholder="Email"
        className="border p-2 w-full"
      />
      {errors.email && <p className="text-red-500">{errors.email.message as string}</p>}

      {/* Password */}
      <input
        {...register('password', {
          required: "Mot de passe obligatoire",
          minLength: {
            value: 6,
            message: "Minimum 6 caractères"
          },
          maxLength: {
            value: 20,
            message: "Maximum 20 caractères"
          }
        })}
        type="password"
        placeholder="Mot de passe"
        className="border p-2 w-full"
      />
      {errors.password && <p className="text-red-500">{errors.password.message as string}</p>}

      {/* First Name */}
      <input
        {...register('first_name', {
          required: "Prénom obligatoire",
          minLength: {
            value: 2,
            message: "Minimum 2 caractères"
          },
          pattern: {
            value: /^[A-Za-zÀ-ÿ\s-]+$/,
            message: "Prénom invalide"
          }
        })}
        placeholder="Prénom"
        className="border p-2 w-full"
      />
      {errors.first_name && <p className="text-red-500">{errors.first_name.message as string}</p>}

      {/* Last Name */}
      <input
        {...register('last_name', {
          required: "Nom obligatoire",
          minLength: {
            value: 2,
            message: "Minimum 2 caractères"
          },
          pattern: {
            value: /^[A-Za-zÀ-ÿ\s-]+$/,
            message: "Nom invalide"
          }
        })}
        placeholder="Nom"
        className="border p-2 w-full"
      />
      {errors.last_name && <p className="text-red-500">{errors.last_name.message as string}</p>}

      <button type="submit" className="bg-blue-500 text-white p-2 w-full">
        S'inscrire
      </button>
    </form>
  );
}