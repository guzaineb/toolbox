'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MessageSquare, ChevronDown } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import DocumentUploader from './DocumentUploader'
import VoiceRecorder from './VoiceRecorder'
import { askCoach, indexProject, listDocuments } from '@/services/coach.service'
import { Button } from '@/components/shared/ui'
import type { ChatMessage as ChatMessageType, ChatSource, UploadedDocument } from '@/types/coach'

interface CoachChatProps {
  projectId: string
}

export default function CoachChat({ projectId }: CoachChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [sourcesMap, setSourcesMap] = useState<Record<number, ChatSource[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const loadDocuments = useCallback(async () => {
    try {
      const result = await listDocuments(projectId)
      setDocuments(result.documents)
    } catch {
      // silent
    }
  }, [projectId])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const handleSend = useCallback(
    async (question: string) => {
      setError(null)
      setLoading(true)

      const userMsg: ChatMessageType = { role: 'user', content: question }
      setMessages((prev) => [...prev, userMsg])

      try {
        const result = await askCoach(projectId, question, messages)

        const assistantMsg: ChatMessageType = { role: 'assistant', content: result.answer }
        setMessages((prev) => {
          const next = [...prev, assistantMsg]
          if (result.sourcesUsed.length > 0) {
            setSourcesMap((prev) => ({ ...prev, [next.length - 1]: result.sourcesUsed }))
          }
          return next
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        setError(msg)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Désolé, une erreur est survenue : ${msg}` },
        ])
      } finally {
        setLoading(false)
      }
    },
    [projectId, messages],
  )

  const handleRetry = useCallback(() => {
    if (messages.length < 2) return
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, -1))
      handleSend(lastUserMsg.content)
    }
  }, [messages, handleSend])

  const handleQuickAction = useCallback(
    (action: string) => {
      handleSend(action)
    },
    [handleSend],
  )

  const handleStartStep = useCallback(() => {
    handleSend('Commencer cette étape : décrivez-moi la prochaine action à réaliser')
  }, [handleSend])

  const handleIndex = useCallback(async () => {
    try {
      setLoading(true)
      await indexProject(projectId)
      await loadDocuments()
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [projectId, loadDocuments])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink/[.08]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-moss" />
          <h3 className="text-[12px] font-bold text-ink font-syne">Conversation avec le Coach</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 rounded-lg hover:bg-ink/[.04] text-ink3 hover:text-ink2 transition-colors"
            title="Historique"
          >
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showHistory && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-full bg-moss/10 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-moss" />
            </div>
            <p className="text-[13px] text-ink2 font-dm font-medium mb-1">
              Posez vos questions au coach
            </p>
            <p className="text-[11px] text-ink3 font-dm mb-4">
              Le coach analyse votre projet et vous guide étape par étape
            </p>

            <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
              <button
                onClick={() => handleQuickAction('Quel est l\'état d\'avancement de mon projet ?')}
                className="text-[10px] font-dm text-moss bg-moss-light/50 border border-moss/15 rounded-full px-2.5 py-1 hover:bg-moss-light transition-colors"
              >
                État du projet
              </button>
              <button
                onClick={() => handleQuickAction('Y a-t-il des incohérences dans mon dossier ?')}
                className="text-[10px] font-dm text-amber-dark bg-amber-light/50 border border-amber/15 rounded-full px-2.5 py-1 hover:bg-amber-light transition-colors"
              >
                Vérifier incohérences
              </button>
              <button
                onClick={() => handleQuickAction('Quelle est ma prochaine action ?')}
                className="text-[10px] font-dm text-blue bg-blue-light/50 border border-blue/15 rounded-full px-2.5 py-1 hover:bg-blue-light transition-colors"
              >
                Prochaine action
              </button>
              <button
                onClick={handleStartStep}
                className="text-[10px] font-dm text-moss bg-moss border border-moss rounded-full px-2.5 py-1 hover:bg-moss-mid transition-colors text-white"
              >
                Commencer cette étape
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            sources={sourcesMap[i]}
            onRetry={msg.role === 'assistant' && i === messages.length - 1 ? handleRetry : undefined}
          />
        ))}

        {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <ChatMessage role="assistant" content="" loading />
        )}

        {error && (
          <div className="text-[11px] text-red font-dm text-center py-1">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="px-4 py-2 border-t border-ink/[.08]">
          <DocumentUploader
            projectId={projectId}
            documents={documents}
            onUploaded={loadDocuments}
            onIndex={handleIndex}
          />
        </div>
      )}

      {/* Voice panel */}
      {showVoice && (
        <div className="px-4 py-2 border-t border-ink/[.08]">
          <VoiceRecorder onTranscript={handleSend} />
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-2.5 border-t border-ink/[.08]">
        <ChatInput
          onSend={handleSend}
          onUploadClick={() => setShowUpload(!showUpload)}
          onMicClick={() => setShowVoice(!showVoice)}
          loading={loading}
        />
      </div>
    </div>
  )
}
