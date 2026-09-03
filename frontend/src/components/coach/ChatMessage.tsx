'use client'

import { cn } from '@/lib/utils'
import { Bot, User, RefreshCw } from 'lucide-react'
import SourceReferences from './SourceReferences'
import type { ChatSource } from '@/types/coach'

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-ink/[.06] px-1 py-0.5 rounded text-[11px]">$1</code>')
    .replace(/^### (.*$)/gm, '<h3 class="text-[12px] font-bold text-ink font-syne mt-2 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-[13px] font-bold text-ink font-syne mt-2 mb-1">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-[14px] font-bold text-ink font-syne mt-2 mb-1">$1</h1>')
    .replace(/^[-*] (.*$)/gm, '<li class="ml-3 list-disc text-[12px] text-ink2 font-dm">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="my-1">${match}</ul>`)
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-3 list-decimal text-[12px] text-ink2 font-dm">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export default function ChatMessage({
  role,
  content,
  sources,
  loading,
  onRetry,
  className,
}: {
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
  loading?: boolean
  onRetry?: () => void
  className?: string
}) {
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'flex gap-2',
        isUser ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-moss flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-[10px] px-3 py-2',
          isUser
            ? 'bg-moss text-white rounded-br-sm'
            : 'bg-ink/[.04] border border-ink/[.08] text-ink rounded-bl-sm',
        )}
      >
        {loading ? (
          <div className="flex items-center gap-1.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div
            className={cn(
              'text-[12px] leading-relaxed font-dm',
              isUser ? 'text-white' : 'text-ink2',
            )}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}

        {!isUser && sources && sources.length > 0 && !loading && (
          <div className="mt-2 pt-2 border-t border-ink/[.06]">
            <SourceReferences sources={sources} />
          </div>
        )}

        {!isUser && !loading && onRetry && (
          <button
            onClick={onRetry}
            className="mt-1.5 flex items-center gap-1 text-[9px] text-ink3 hover:text-moss transition-colors font-dm"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            Ressayer
          </button>
        )}
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-full bg-ink/[.08] flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-ink2" />
        </div>
      )}
    </div>
  )
}
