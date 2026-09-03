'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Send, Mic, Paperclip, Loader2 } from 'lucide-react'
import { Button } from '@/components/shared/ui'

export default function ChatInput({
  onSend,
  onUploadClick,
  onMicClick,
  loading,
  disabled,
  className,
}: {
  onSend: (message: string) => void
  onUploadClick?: () => void
  onMicClick?: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || loading || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, loading, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  return (
    <div
      className={cn(
        'flex items-end gap-2 rounded-[12px] border border-ink/[.12] bg-white px-3 py-2',
        className,
      )}
    >
      {onUploadClick && (
        <button
          onClick={onUploadClick}
          disabled={disabled}
          className="p-1.5 rounded-lg hover:bg-ink/[.04] transition-colors text-ink3 hover:text-ink2 disabled:opacity-40"
          title="Joindre un document"
        >
          <Paperclip className="w-4 h-4" />
        </button>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Posez votre question au coach…"
        rows={1}
        disabled={disabled || loading}
        className="flex-1 resize-none border-none outline-none bg-transparent text-[12px] text-ink font-dm placeholder:text-ink3/60 max-h-[120px] py-1"
      />

      {onMicClick && (
        <button
          onClick={onMicClick}
          disabled={disabled}
          className="p-1.5 rounded-lg hover:bg-ink/[.04] transition-colors text-ink3 hover:text-ink2 disabled:opacity-40"
          title="Message vocal"
        >
          <Mic className="w-4 h-4" />
        </button>
      )}

      <Button
        variant="primary"
        size="sm"
        onClick={handleSend}
        disabled={!value.trim() || loading || disabled}
        className="shrink-0"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
      </Button>
    </div>
  )
}
