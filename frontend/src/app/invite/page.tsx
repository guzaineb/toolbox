import Link from 'next/link'
import { Button } from '@/components/shared/ui'

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-[14px] p-9 shadow-md">
        <div className="font-display text-[22px] text-text mb-5 text-center">
          Project<span className="text-accent">Struct</span>
        </div>

        {/* Org banner */}
        <div className="bg-accent-light rounded p-[14px] flex items-center gap-3 mb-5">
          <div className="w-[30px] h-[30px] rounded-full bg-accent text-white flex items-center justify-center text-[16px]">🏢</div>
          <div>
            <div className="text-[13px] font-semibold text-accent">StartUp Tunisia Hub</div>
            <div className="text-[11px] text-accent-mid">vous invite à rejoindre l'équipe</div>
          </div>
        </div>

        <h1 className="text-[20px] font-semibold mb-1">Invitation reçue</h1>
        <p className="text-[13px] text-text-2 mb-4">
          Mehdi Trabelsi vous invite à rejoindre <strong>StartUp Tunisia Hub</strong> en tant que <strong>Program Manager</strong>.
        </p>

        <div className="bg-bg rounded-sm p-3 mb-4 text-[12px] text-text-2">
          <div className="mb-1"><strong>Incubateur :</strong> StartUp Tunisia Hub</div>
          <div className="mb-1"><strong>Rôle proposé :</strong> Program Manager</div>
          <div><strong>Invité par :</strong> Mehdi Trabelsi (Admin)</div>
        </div>

        <Link href="/dashboard">
          <Button variant="primary" fullWidth className="mb-2">Accepter l'invitation</Button>
        </Link>
        <Button fullWidth className="justify-center !text-red">Décliner</Button>

        <div className="flex items-center gap-2.5 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-text-3">Pas encore de compte ?</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link href="/register">
          <Button fullWidth className="justify-center">Créer un compte pour accepter →</Button>
        </Link>
        <p className="text-[12px] text-center mt-3">
          <Link href="/login" className="text-accent">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
