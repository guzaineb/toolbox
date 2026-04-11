"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Ajuste le chemin selon ton projet
import { Button, ErrorAlert, Input } from '@/components/auth/ui';


export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const router = useRouter();
  
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      setServerError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-[420px] bg-white border border-gray-200 rounded-[20px] p-9 shadow-sm">
        
        {/* Logo / Branding */}
        <div className="text-[22px] font-bold text-gray-800 mb-7 text-center">
          Project<span className="text-violet-600">Struct</span>
        </div>

        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-gray-900 mb-1">Connexion</h1>
          <p className="text-[13px] text-gray-500">Accédez à votre espace d'innovation</p>
        </div>

        {/* Alerte d'erreur si le login échoue */}
        {serverError && (
          <div className="mb-5">
            <ErrorAlert message={serverError} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Email"
            type="email"
            placeholder="vous@example.com"
            {...register('email', { required: "L'email est requis" })}
            error={errors.email?.message as string}
          />

          <Input 
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            {...register('password', { required: "Le mot de passe est requis" })}
            error={errors.password?.message as string}
          />

          <div className="text-right -mt-2">
            <Link href="/forgot" className="text-[12px] text-violet-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={isLoading}
          >
            Se connecter
          </Button>
        </form>

        <p className="text-[12px] text-gray-500 text-center mt-6">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-violet-600 font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>

        {/* Section Séparateur (Simulation de ton ancien Sep) */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
        </div>

        
      </div>
    </div>
  );
}