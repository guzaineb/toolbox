import { Button, Field, Input, Progress } from '@/components/shared/ui'
import Link from 'next/link'

export default function ResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-[14px] p-9 shadow-md">
        
        <div className="font-display text-[22px] text-text mb-7 text-center">
          Project<span className="text-accent">Struct</span>
        </div>

        <h1 className="text-[20px] font-semibold mb-1">
          Nouveau mot de passe
        </h1>

        <p className="text-[13px] text-text-2 mb-6">
          Choisissez un mot de passe sécurisé
        </p>

        <Field label="Nouveau mot de passe">
          <Input type="password" defaultValue="••••••••••" />
        </Field>

        <Field label="Confirmer">
          <Input type="password" defaultValue="••••••••••" />
        </Field>

        <div className="mb-[14px]">
          <Progress value={80} />
        </div>

        <Link href="/login">
          <Button variant="primary" fullWidth>
            Réinitialiser et se connecter
          </Button>
        </Link>

      </div>
    </div>
  )
}