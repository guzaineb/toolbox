
import { Button, Field, Input } from '@/components/shared/ui'
import Link from 'next/link'

export default function ForgotPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-[14px] p-9 shadow-md">
        <div className="font-display text-[22px] text-text mb-7 text-center">
          Project<span className="text-accent">Struct</span>
        </div>
        <h1 className="text-[20px] font-semibold mb-1">Mot de passe oublié</h1>
        <p className="text-[13px] text-text-2 mb-6">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
        <Field label="Email">
          <Input type="email" defaultValue="mehdi@projectstruct.io" />
        </Field>
        <Link href="/reset">
          <Button variant="primary" fullWidth>Envoyer le lien</Button>
        </Link>
        <p className="text-[12px] text-center mt-4">
          <Link href="/login" className="text-accent">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
