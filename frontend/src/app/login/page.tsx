"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Field, Sep, ErrorAlert } from '@/components/shared/ui';

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

    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ||
        "Identifiants incorrects. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-xl p-9 shadow-sm">
        
        <div className="font-semibold text-[22px] text-text mb-7 text-center">
          Project<span className="text-accent">Struct</span>
        </div>

        <div className="mb-8">
          <h1 className="text-[20px] font-bold text-text mb-1">Connexion</h1>
          <p className="text-[13px] text-text-2">Accédez à votre espace</p>
        </div>

        {serverError && (
          <div className="mb-5">
            <ErrorAlert message={serverError} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <Field label="Email">
            <Input 
              type="email"
              placeholder="vous@example.com"
              {...register('email', { required: "L'email est requis" })}
            />
            {errors.email && (
              <span className="text-[11px] text-red mt-1 block">
                {errors.email.message as string}
              </span>
            )}
          </Field>

          <Field label="Mot de passe">
            <Input 
              type="password"
              placeholder="••••••••"
              {...register('password', { required: "Le mot de passe est requis" })}
            />
            {errors.password && (
              <span className="text-[11px] text-red mt-1 block">
                {errors.password.message as string}
              </span>
            )}
          </Field>

          <div className="text-right">
            <Link href="/forgot" className="text-[12px] text-accent hover:underline">
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

        <Sep />

        <p className="text-[12px] text-text-2 text-center">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-accent font-medium hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}