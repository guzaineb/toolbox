'use client'

import { ThumbsUp, ThumbsDown, TrendingUp, ShieldAlert, type LucideIcon } from 'lucide-react'
import { Textarea } from '@/components/shared/ui'

interface SwotQuadrant {
  key: string
  title: string
  hint: string
  icon: LucideIcon
  border: string
  headerBg: string
  text: string
}

const QUADRANTS: SwotQuadrant[] = [
  {
    key: 'strengths',
    title: 'Forces',
    hint: "Points forts internes du projet identifiés par l'IA ou par vous.",
    icon: ThumbsUp,
    border: 'border-moss/25',
    headerBg: 'bg-moss/10',
    text: 'text-moss',
  },
  {
    key: 'weaknesses',
    title: 'Faiblesses',
    hint: "Points de vigilance et limites internes à transformer en actions.",
    icon: ThumbsDown,
    border: 'border-red/25',
    headerBg: 'bg-red/10',
    text: 'text-red',
  },
  {
    key: 'opportunities',
    title: 'Opportunités',
    hint: "Leviers externes de croissance sur lesquels s'appuyer.",
    icon: TrendingUp,
    border: 'border-blue/25',
    headerBg: 'bg-blue/10',
    text: 'text-blue',
  },
  {
    key: 'threats',
    title: 'Menaces',
    hint: 'Risques externes à surveiller et à anticiper.',
    icon: ShieldAlert,
    border: 'border-amber/25',
    headerBg: 'bg-amber/10',
    text: 'text-amber-dark',
  },
]

function strValue(data: Record<string, unknown>, key: string): string {
  return typeof data[key] === 'string' ? data[key] : ''
}

interface SwotFormProps {
  data: Record<string, unknown>
  onChange: (key: string, value: string) => void
}

export function SwotForm({ data, onChange }: SwotFormProps) {
  return (
    <div>
      <p className="text-xs text-ink3 font-dm mb-3">
        Analyse SWOT du projet : forces et faiblesses internes, opportunités et menaces externes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUADRANTS.map((q) => {
          const Icon = q.icon
          return (
            <div
              key={q.key}
              className={`rounded-lg border ${q.border} bg-surface overflow-hidden`}
            >
              <div className={`flex items-center gap-1.5 px-3 py-2 ${q.headerBg}`}>
                <Icon size={13} className={q.text} />
                <span className={`text-xs font-bold font-syne ${q.text}`}>{q.title}</span>
              </div>
              <div className="p-3">
                <Textarea
                  value={strValue(data, q.key)}
                  onChange={(e) => onChange(q.key, e.target.value)}
                  placeholder={q.hint}
                  rows={5}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}