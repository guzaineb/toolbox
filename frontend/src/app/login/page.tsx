"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Field, Sep, ErrorAlert } from '@/components/shared/ui';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { login, redirectToDashboard } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const user = await login(data.email, data.password);
      // user.role comes from /users/me — matches ROLE_ROUTES keys exactly
      redirectToDashboard(user.role);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Une erreur est survenue.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-xl p-9 shadow-sm">

        {/* Logo */}
        <div className="font-semibold text-[22px] text-text mb-7 text-center">
          Project<span className="text-accent">Struct</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-[20px] font-bold text-text mb-1">Connexion</h1>
          {/* ✅ FIX: was text-[1authpx] */}
          <p className="text-[14px] text-text-2">Accédez à votre espace</p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-5">
            <ErrorAlert message={serverError} />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <Field label="Email">
            <Input
              type="email"
              placeholder="vous@example.com"
              {...register('email', { required: "L'email est requis" })}
            />
            {errors.email && (
              <span className="text-[11px] text-red mt-1 block">
                {errors.email.message}
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
                {errors.password.message}
              </span>
            )}
          </Field>

          <div className="text-right">
            <Link
              href="/auth/reset"
              className="text-[12px] text-accent hover:underline"
            >
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