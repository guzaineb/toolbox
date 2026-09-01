import { Button } from '@/components/shared/ui'
import Link from 'next/link'


export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-center p-10">
      <div>
        <div className="font-display text-[80px] text-border-strong leading-none mb-3">404</div>
        <div className="text-[18px] font-semibold mb-2">Page introuvable</div>
        <div className="text-[13px] text-text-2 mb-6">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </div>
        <div className="flex gap-2 justify-center">
          <Link href="/login"><Button>← Accueil</Button></Link>
          <Link href="/dashboard"><Button variant="primary">Dashboard</Button></Link>
        </div>
      </div>
    </div>
  )
}