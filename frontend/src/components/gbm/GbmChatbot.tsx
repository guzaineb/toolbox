'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Loader2, RefreshCw, Send, Sparkles, User } from 'lucide-react'
import { chatbotService, type ChatMessage } from '@/services/chatbot.service'
import { Button } from '@/components/shared/ui'
import { cn } from '@/lib/utils'

interface GbmChatbotProps {
  projectId: string
}

const SUGGESTIONS = [
  "Résume mon projet en 3 points",
  "Quelles sont mes principales forces ?",
  "Comment améliorer ma proposition de valeur ?",
  "Quels risques dois-je surveiller ?",
]

function renderAnswer(text: string) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return <div key={i} className="h-1.5" />
    if (/^[-*•]\s+/.test(trimmed)) {
      return (
        <div key={i} className="flex gap-1.5 pl-1">
          <span className="text-moss">•</span>
          <span className="flex-1">{renderInline(trimmed.replace(/^[-*•]\s+/, ''))}</span>
        </div>
      )
    }
    return <div key={i}>{renderInline(trimmed)}</div>
  })
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export function GbmChatbot({ projectId }: GbmChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [indexing, setIndexing] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text?: string) => {
    const question = (text ?? input).trim()
    if (!question || loading) return

    const history = messages.slice(-6)
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setInput('')
    setLoading(true)
    setError('')
    try {
      const result = await chatbotService.ask(projectId, question, history)
      const answer = result?.data?.answer ?? 'Désolé, je n’ai pas pu formuler de réponse.'
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Le service IA est temporairement indisponible. Réessayez dans quelques instants, ou écrivez la réponse vous-même dans les étapes.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleIndex = async () => {
    setIndexing(true)
    setError('')
    try {
      const result = await chatbotService.indexProject(projectId)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Projet indexé : ${result?.data?.documentsIndexed ?? 0} document(s) analysé(s). Vous pouvez maintenant poser vos questions.` },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Indexation impossible (aucune donnée disponible ou service IA indisponible). Je peux quand même répondre à partir du contexte du projet.' },
      ])
    } finally {
      setIndexing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-surface-2">
        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
          <Bot size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold text-ink leading-tight">Assistant IA</div>
          <div className="text-[10px] text-ink3">Conseils sur votre GBM</div>
        </div>
        <button
          onClick={handleIndex}
          disabled={indexing}
          className="flex items-center gap-1 text-[10px] font-semibold text-moss hover:bg-moss-light rounded px-2 py-1 transition-colors"
          title="Indexer le projet"
        >
          {indexing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          Indexer
        </button>
      </div>

      <div className="flex-1 max-h-[320px] overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <div className="text-[11px] text-ink2 leading-relaxed px-3 py-2 rounded-lg bg-moss/[.06] border border-moss/15">
              Posez-moi des questions sur votre projet : je m&apos;appuie sur votre GBM et vos documents pour vous conseiller.
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="text-[10.5px] text-moss bg-moss-light border border-moss/20 rounded-full px-2.5 py-1 hover:bg-moss/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              'flex items-start gap-2',
              message.role === 'user' && 'flex-row-reverse',
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                message.role === 'user' ? 'bg-moss text-white' : 'bg-purple-100 text-purple-700',
              )}
            >
              {message.role === 'user' ? <User size={12} /> : <Bot size={12} />}
            </div>
            <div
              className={cn(
                'text-[12px] leading-relaxed px-3 py-2 rounded-lg max-w-[85%]',
                message.role === 'user'
                  ? 'bg-moss text-white'
                  : 'bg-ink/[.05] text-ink border border-border',
              )}
            >
              {message.role === 'assistant' ? renderAnswer(message.content) : <span className="whitespace-pre-wrap">{message.content}</span>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-[11px] text-ink3">
            <Loader2 size={13} className="animate-spin text-moss" /> L&apos;assistant réfléchit…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-2.5 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question…"
            className="flex-1 text-[12px] px-3 py-2 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(45,122,82,0.09)] placeholder:text-ink3"
          />
          <Button size="sm" variant="primary" onClick={() => handleSend()} disabled={!input.trim()} aria-label="Envoyer">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </Button>
        </div>
        {error && <p className="text-[10px] text-red mt-1.5">{error}</p>}
        <p className="text-[9px] text-ink3 mt-1.5 flex items-center gap-1">
          <Sparkles size={9} /> L&apos;IA répond à partir de votre GBM ; vérifiez toujours les informations clés.
        </p>
      </div>
    </div>
  )
}
