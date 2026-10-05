'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button, ErrorAlert, Input } from '@/components/shared/ui'
import type { CoachingComment } from '@/types/coaching'
import { apiError, formatDateTime } from '@/lib/utils'
import { useActionComments, useAddActionComment } from '@/hooks/useCoaching'

function authorName(author?: CoachingComment['author']): string {
  if (!author) return '—'
  return author.profile
    ? `${author.profile.first_name} ${author.profile.last_name}`
    : author.email
}

/**
 * Commentaires d'une action de coaching.
 *
 * Le backend expose GET/POST `/coaching/actions/:id/comments` et applique les
 * mêmes droits de lecture/écriture aux deux profils : quiconque peut consulter
 * le coaching d'un projet (porteur, coach, membre d'incubateur) peut lire et
 * ajouter un commentaire — la forme `addComment` ne distingue pas de rôle.
 * Ce composant respecte cette règle : aucune restriction locale, c'est le
 * backend qui refuse (403/404) si l'utilisateur n'a pas accès au projet.
 *
 * L'ajout repose sur `useAddActionComment` (mutation React Query) : seuls les
 * commentaires de l'action sont invalidés — aucune requête projet, aucun
 * rechargement de page.
 */
export function ActionComments({ actionId }: { actionId: string }) {
  const {
    data: comments,
    isLoading,
    isError,
    error: commentsError,
  } = useActionComments(actionId)
  const addComment = useAddActionComment(actionId)

  const [text, setText] = useState('')
  const [postError, setPostError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [success])

  const list = comments ?? []

  const submit = async () => {
    const content = text.trim()
    if (!content) return
    setSuccess(false)
    setPostError(null)
    try {
      await addComment.mutateAsync({ content })
      setText('')
      setSuccess(true)
    } catch (err) {
      setPostError(apiError(err, "Erreur lors de l'ajout du commentaire"))
    }
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink2">
        <MessageSquare size={11} className="text-moss" />
        Commentaires ({list.length})
      </div>

      {isLoading && list.length === 0 && (
        <p className="text-[11px] text-ink3">Chargement des commentaires…</p>
      )}

      {isError && !isLoading && (
        <ErrorAlert message={apiError(commentsError, 'Erreur de chargement des commentaires')} />
      )}

      {!isLoading && !isError && list.length === 0 && (
        <p className="text-[11px] text-ink3">Aucun commentaire pour cette action.</p>
      )}

      {list.map((c) => (
        <div key={c.id} className="text-[11px] text-ink2 bg-surface border border-border rounded-lg p-2.5">
          <div className="text-[10px] text-ink3">
            <span className="font-semibold text-ink2">{authorName(c.author)}</span>
            {' · '}
            {formatDateTime(c.created_at, { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
          <div className="mt-0.5 whitespace-pre-wrap">{c.content}</div>
        </div>
      ))}

      {success && !postError && (
        <p className="text-[11px] text-moss font-semibold">Commentaire ajouté.</p>
      )}
      {postError && <ErrorAlert message={postError} />}

      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ajouter un commentaire…"
          className="!py-[4px] !text-[11px] flex-1"
          onKeyDown={(e) => { if (e.key === 'Enter' && text.trim() && !addComment.isPending) submit() }}
        />
        <Button
          size="sm"
          variant="primary"
          loading={addComment.isPending}
          disabled={!text.trim()}
          onClick={submit}
        >
          <Send size={11} /> Envoyer
        </Button>
      </div>
    </div>
  )
}