'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Building2, CheckCircle2, XCircle, Loader2, AlertTriangle,
  ArrowLeft, UserCheck, UserX, Mail, Shield, Send,
} from 'lucide-react'
import api from '@/services/api'
import {
  Button, Card, CardHeader, Badge, ErrorAlert, SuccessAlert, Avatar,
} from '@/components/shared/ui'

export default function AcceptInvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'idle' | 'accepting' | 'declining' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  // Vérifier la présence du token dès le chargement
  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage("Token d'invitation manquant")
    }
  }, [token])

  const handleAccept = async () => {
    if (!token) return
    setStatus('accepting')
    try {
      await api.post('/incubators/:incubatorId/members/accept', { token })
      setStatus('success')
      setMessage('Invitation acceptée avec succès !')
      setTimeout(() => {
        router.push('/dashboard/incubator')
      }, 2000)
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.response?.data?.message || "Erreur lors de l'acceptation")
    }
  }

  const handleDecline = async () => {
    if (!token) return
    setStatus('declining')
    try {
      await api.post('/incubators/:incubatorId/members/decline', { token })
      setStatus('success')
      setMessage('Invitation refusée.')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.response?.data?.message || 'Erreur lors du refus')
    }
  }

  // Affichage selon l'état
  if (status === 'idle' && token) {
    return (
      <div className="min-h-screen bg-[#f5f2eb] flex items-center justify-center p-4">
        <Card className="max-w-[440px] w-full p-0 overflow-hidden">
          <div className="p-[18px] text-center border-b border-border bg-surface-2">
            <div className="w-14 h-14 rounded-[14px] bg-moss-light text-moss flex items-center justify-center mx-auto mb-3">
              <Building2 size={28} />
            </div>
            <h2 className="font-syne text-[20px] font-extrabold text-ink mb-1">
              Invitation à rejoindre un incubateur
            </h2>
            <p className="text-[12px] text-ink3">
              Vous avez été invité à rejoindre un espace incubateur. Souhaitez-vous accepter cette invitation ?
            </p>
          </div>

          <div className="p-[18px]">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-moss/[.04] border border-moss/10 mb-5">
              <Shield size={14} className="text-moss flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-ink2 leading-relaxed">
                En acceptant, vous rejoindrez l'espace de travail de cet incubateur et recevrez
                une confirmation par email. Vos accès dépendront du rôle qui vous est attribué.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 justify-center"
                onClick={handleDecline}
              >
                <XCircle size={14} />
                Refuser
              </Button>
              <Button
                variant="primary"
                className="flex-1 justify-center"
                onClick={handleAccept}
              >
                <CheckCircle2 size={14} />
                Accepter
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // États de chargement, succès, erreur
  return (
    <div className="min-h-screen bg-[#f5f2eb] flex items-center justify-center p-4">
      <Card className="max-w-[420px] w-full p-0 overflow-hidden text-center">
        {(status === 'accepting' || status === 'declining') && (
          <div className="p-8">
            <Loader2 size={32} className="mx-auto text-moss animate-spin mb-4" />
            <h2 className="font-syne text-[18px] font-bold text-ink mb-2">
              {status === 'accepting' ? 'Acceptation en cours...' : 'Refus en cours...'}
            </h2>
            <p className="text-[12px] text-ink3">Veuillez patienter</p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-8">
            <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
              <UserCheck size={28} />
            </div>
            <h2 className="font-syne text-[20px] font-extrabold text-ink mb-2">Invitation traitée</h2>
            <p className="text-[13px] text-ink2 mb-4">{message}</p>
            <SuccessAlert message="Redirection en cours..." />
          </div>
        )}

        {status === 'error' && (
          <div className="p-8">
            <div className="w-14 h-14 rounded-full bg-red-light text-red flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            <h2 className="font-syne text-[20px] font-extrabold text-ink mb-2">Erreur</h2>
            <p className="text-[13px] text-ink2 mb-5">{message}</p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={13} /> Retour à l'accueil
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}