'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Loader2, Square } from 'lucide-react'
import { Button } from '@/components/shared/ui'

export default function VoiceRecorder({
  onTranscript,
  className,
}: {
  onTranscript: (text: string) => void
  className?: string
}) {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const media = new MediaRecorder(stream)
      mediaRef.current = media

      const chunks: Blob[] = []
      media.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      media.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setProcessing(true)

        const blob = new Blob(chunks, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          // Backend transcription not yet wired — show placeholder
          setTimeout(() => {
            setProcessing(false)
            onTranscript('[Transcription vocale — fonctionnalité à venir]')
          }, 1000)
        }
        reader.readAsDataURL(blob)
      }

      media.start()
      setRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } catch {
      // mic permission denied or unavailable
    }
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecording(false)
  }, [])

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn('flex items-center gap-3 p-2 rounded-lg bg-ink/[.02)]', className)}>
      {!recording ? (
        <Button
          variant="outline"
          size="sm"
          onClick={startRecording}
          disabled={processing}
        >
          {processing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
          <span className="text-[11px] font-dm">
            {processing ? 'Transcription…' : 'Enregistrer'}
          </span>
        </Button>
      ) : (
        <Button variant="danger" size="sm" onClick={stopRecording}>
          <Square className="w-3 h-3" />
          <span className="text-[11px] font-dm">
            Arrêter ({formatDuration(duration)})
          </span>
        </Button>
      )}

      {recording && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
          <span className="text-[10px] text-red font-dm font-medium">Enregistrement</span>
        </div>
      )}
    </div>
  )
}
