import { Button } from '@/components/auth/ui'
import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-[14px] p-9 shadow-md text-center">
        <div className="font-display text-[22px] text-text mb-7 text-center">
          Project<span className="text-accent">Struct</span>
        </div>
        <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center text-2xl mx-auto mb-5">✉</div>
        <h1 className="text-[20px] font-semibold mb-1">Vérifiez votre email</h1>
        <p className="text-[13px] text-text-2 mb-5">
          Un lien de confirmation a été envoyé à<br />
          <strong>mehdi@projectstruct.io</strong>
        </p>
        <Link href="/onboarding/step1">
          <Button variant="primary" fullWidth>J'ai confirmé mon email →</Button>
        </Link>
        <p className="text-[12px] text-text-2 mt-3 cursor-pointer">Renvoyer l'email</p>
        <p className="text-[12px] mt-1">
          <Link href="/login" className="text-accent">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
