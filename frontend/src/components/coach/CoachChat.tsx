'use client'

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { MessageSquare, ChevronDown, Plus, AlertTriangle } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import DocumentUploader from './DocumentUploader'
import VoiceRecorder from './VoiceRecorder'
import {
  askCoach,
  indexProject,
  listDocuments,
  listConversations,
  listConversationMessages,
  getRagHealth,
} from '@/services/coach.service'
import type {
  ChatMessage as ChatMessageType,
  ChatSource,
  UploadedDocument,
  Conversation,
  ConversationMessage,
  RagHealthResult,
} from '@/types/coach'

interface CoachChatProps {
  projectId: string
}

export interface CoachChatHandle {
  sendMessage: (msg: string) => void
}

const CoachChat = forwardRef<CoachChatHandle, CoachChatProps>(({ projectId }, ref) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [sourcesMap, setSourcesMap] = useState<Record<number, ChatSource[]>>({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showConversationList, setShowConversationList] = useState(false)
  const [ragHealth, setRagHealth] = useState<RagHealthResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useImperativeHandle(ref, () => ({
    sendMessage: (msg: string) => handleSend(msg),
  }))

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

  const loadRagHealth = useCallback(async () => {
    try {
      const result = await getRagHealth(projectId)
      setRagHealth(result)
    } catch {
      setRagHealth(null)
    }
  }, [projectId])

  const loadConversationMessages = useCallback(
    async (conversationId: string) => {
      try {
        const result: ConversationMessage[] = await listConversationMessages(conversationId, projectId)
        const loaded: ChatMessageType[] = result.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
        setMessages(loaded)

        const newSourcesMap: Record<number, ChatSource[]> = {}
        result.forEach((m, i) => {
          if (m.sources && Array.isArray(m.sources) && (m.sources as ChatSource[]).length > 0) {
            newSourcesMap[i] = m.sources as ChatSource[]
          }
        })
        setSourcesMap(newSourcesMap)
      } catch {
        setMessages([])
      }
    },
    [projectId],
  )

  const loadConversations = useCallback(async () => {
    try {
      const result = await listConversations(projectId)
      setConversations(result)
      return result
    } catch {
      setConversations([])
      return []
    }
  }, [projectId])

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(null)
    setMessages([])
    setSourcesMap({})
    setShowConversationList(false)
  }, [])

  const handleSelectConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId)
      setShowConversationList(false)
      await loadConversationMessages(conversationId)
    },
    [loadConversationMessages],
  )

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    const init = async () => {
      setInitialLoading(true)
      await Promise.all([loadDocuments(), loadRagHealth()])
      const convs = await loadConversations()

      if (convs.length > 0) {
        const latest = convs[0]
        setActiveConversationId(latest.id)
        if (latest.messageCount > 0) {
          await loadConversationMessages(latest.id)
        }
      }
      setInitialLoading(false)
    }

    init()
  }, [loadDocuments, loadRagHealth, loadConversations, loadConversationMessages])

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

        if (!activeConversationId && result.conversationId) {
          setActiveConversationId(result.conversationId)
          await loadConversations()
        } else if (activeConversationId) {
          await loadConversations()
        }

        if (result.ragStatus === 'RAG_UNAVAILABLE') {
          await loadRagHealth()
        }
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
    [projectId, messages, activeConversationId, loadConversations, loadRagHealth],
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

  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink/[.08]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-moss" />
          <h3 className="text-[12px] font-bold text-ink font-syne">Conversation avec le Coach</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleNewConversation}
            className="text-[10px] font-dm text-ink3 hover:text-moss transition-colors p-1 rounded"
            title="Nouvelle conversation"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {conversations.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowConversationList(!showConversationList)}
                className="flex items-center gap-1 text-[10px] font-dm text-ink3 hover:text-ink2 transition-colors px-1.5 py-1 rounded border border-ink/[.08]"
              >
                <span className="max-w-[100px] truncate">
                  {activeConversation?.title || `Conversation ${conversations.length}`}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showConversationList && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-ink/[.08] rounded-[10px] shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full text-left px-3 py-2 text-[10px] font-dm transition-colors ${
                        conv.id === activeConversationId
                          ? 'bg-moss-light/30 text-moss font-medium'
                          : 'text-ink2 hover:bg-ink/[.03]'
                      }`}
                    >
                      <div className="truncate">
                        {conv.title || `Conversation`}
                      </div>
                      <div className="text-[9px] text-ink3 mt-0.5">
                        {conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RAG status banner */}
      {ragHealth && ragHealth.overall === 'degraded' && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-light/30 border-b border-amber/15 text-[10px] font-dm text-amber-dark">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            La recherche documentaire (RAG) est indisponible. Les réponses du coach se basent uniquement sur les données structurées du projet.
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-8 h-8 border-2 border-moss/30 border-t-moss rounded-full animate-spin mb-3" />
            <p className="text-[11px] text-ink3 font-dm">Chargement de la conversation…</p>
          </div>
        ) : messages.length === 0 ? (
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
        ) : (
          messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              sources={sourcesMap[i]}
              onRetry={msg.role === 'assistant' && i === messages.length - 1 ? handleRetry : undefined}
            />
          ))
        )}

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
          <VoiceRecorder projectId={projectId} onTranscript={handleSend} />
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
})

CoachChat.displayName = 'CoachChat'

export default CoachChat
