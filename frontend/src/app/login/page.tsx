"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';

import { Button, Input, Field, Sep, ErrorAlert } from '@/components/shared/ui';

import { LoginSVG } from '@/components/auth/GeoSVGs';
import AuthShell from '@/components/auth/AuthShell';
import LeftPanel from '@/components/auth/LeftPanel';
import RightPanel from '@/components/auth/RightPanel';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { login, redirectToDashboard } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const user = await login(data.email, data.password);
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
    <AuthShell
      left={
        <LeftPanel
          svgContent={<LoginSVG />}
          tag="Écosystème Innovation "
          title="Votre hub d'innovation en Afrique du Nord"
          subtitle="Connectez porteurs de projets, experts et incubateurs sur une seule plateforme structurée."
          stats={[
            { num: '140+', label: 'Incubateurs' },
            { num: '2.4k', label: 'Experts' },
            { num: '12k', label: 'Projets' },
          ]}
          testimonial={{
            text: 'ProjectStruct a transformé notre façon de gérer les cohortes et les relations avec les experts.',
            initials: 'SA',
            name: 'Sara Amrani · DG, InnoHub Casablanca',
          }}
        />
      }
      right={
        <RightPanel>
          {/* Logo */}
          <div className="font-syne text-xl sm:text-2xl font-bold text-ink mb-6 sm:mb-8 text-center">
            Tool<span className="text-moss">Box</span>
          </div>

          {/* Heading */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-ink mb-1">Connexion</h1>
            <p className="text-xs sm:text-sm text-ink2">Accédez à votre espace</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
                Email
              </label>
              <input
                type="email"
                placeholder="vous@example.com"
                className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface placeholder:text-ink3 ${
                  errors.email ? 'border-red focus:border-red' : 'border-border'
                }`}
                {...register('email', { required: "L'email est requis" })}
              />
              {errors.email && (
                <span className="text-[10px] sm:text-[11px] text-red mt-1.5 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
                Mot de passe
              </label>
              <div className="relative">
                <input type="password" placeholder="••••••••" className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface placeholder:text-ink3 pr-9 ${
                    errors.password ? 'border-red focus:border-red' : 'border-border'
                  }`}
                  {...register('password', { required: "Le mot de passe est requis" })}
                />
              </div>
              {errors.password && (
                <span className="text-[10px] sm:text-[11px] text-red mt-1.5 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="/auth/reset"
                className="text-[11px] sm:text-xs text-moss hover:text-moss-dark hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold font-syne tracking-wide bg-ink text-white cursor-pointer transition-all duration-200 hover:bg-[#2a2a24] hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 my-5 sm:my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] sm:text-[11px] text-ink3">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          {/* Register Link */}
          <p className="text-[11px] sm:text-xs text-ink2 text-center mt-5 sm:mt-6">
            Pas de compte ?{' '}
            <Link href="/register" className="text-moss font-medium hover:underline">
              Créer un compte
            </Link>
          </p>
        </RightPanel>
      }/>  );
}