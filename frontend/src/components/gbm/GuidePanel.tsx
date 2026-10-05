'use client'

import { BookOpen, CircleHelp, Lightbulb, ListChecks, MessageSquareWarning, Sparkles, TriangleAlert, Wrench } from 'lucide-react'
import type { GbmGuide } from '@/data/gbm/guides'
import type { GbmStepMeta } from '@/data/gbm/steps'

interface GuidePanelProps {
  guide?: GbmGuide
  stepMeta?: GbmStepMeta
}

function Section({
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details open={defaultOpen} className="group rounded-lg border border-border bg-surface overflow-hidden">
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none text-[12px] font-semibold text-ink hover:bg-surface-2 transition-colors">
        <span className="text-moss flex-shrink-0">{icon}</span>
        {title}
        <span className="ml-auto text-ink3 text-[10px] group-open:rotate-90 transition-transform">›</span>
      </summary>
      <div className="px-3 pb-3 text-[12px] text-ink2 leading-relaxed space-y-1.5 border-t border-border pt-2.5">
        {children}
      </div>
    </details>
  )
}

export function GuidePanel({ guide, stepMeta }: GuidePanelProps) {
  if (!guide) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <BookOpen size={14} className="text-moss" />
        <h3 className="font-syne text-[12px] font-bold text-ink">Guide de l&apos;étape</h3>
      </div>

      {stepMeta && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: `${stepMeta.color}14` }}>
          <stepMeta.icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: stepMeta.color }} />
          <p className="text-[12px] font-semibold leading-snug text-ink">{guide.title}</p>
        </div>
      )}

      <Section icon={<Sparkles size={13} />} title="Objectif" defaultOpen>
        <p>{guide.objective}</p>
      </Section>

      <Section icon={<CircleHelp size={13} />} title="Pourquoi cette étape ?">
        <p>{guide.why}</p>
      </Section>

      <Section icon={<ListChecks size={13} />} title="Comment faire">
        <ol className="list-decimal pl-4 space-y-1">
          {guide.instructions.map((instruction, i) => (
            <li key={i}>{instruction}</li>
          ))}
        </ol>
      </Section>

      <Section icon={<Lightbulb size={13} />} title="Conseils">
        <ul className="list-disc pl-4 space-y-1">
          {guide.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </Section>

      <Section icon={<TriangleAlert size={13} />} title="Erreurs fréquentes">
        <ul className="list-disc pl-4 space-y-1 text-red">
          {guide.commonMistakes.map((mistake, i) => (
            <li key={i}>{mistake}</li>
          ))}
        </ul>
      </Section>

      {guide.example && (
        <Section icon={<MessageSquareWarning size={13} />} title="Exemple">
          <p className="italic">{guide.example}</p>
        </Section>
      )}

      <Section icon={<Wrench size={13} />} title="Résultat attendu">
        <p>{guide.expectedResult}</p>
      </Section>

      {guide.faq.length > 0 && (
        <Section icon={<CircleHelp size={13} />} title="Questions fréquentes">
          <div className="space-y-2">
            {guide.faq.map((item, i) => (
              <div key={i}>
                <p className="font-semibold text-ink">{item.q}</p>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {guide.resources.length > 0 && (
        <Section icon={<BookOpen size={13} />} title="Ressources">
          <ul className="list-disc pl-4 space-y-1">
            {guide.resources.map((resource, i) => (
              <li key={i}>{resource}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
