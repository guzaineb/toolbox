'use client';

import { useState } from 'react';
import { BookOpen, Clock, Target, ChevronDown, ChevronUp, HelpCircle, Lightbulb, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepPedagogicalContent } from '@/data/pedagogical-content';
import { Card } from '@/components/shared/ui';
import { ChecklistPanel } from './ChecklistPanel';

export function StepGuide({
  content, defaultOpen = false,
}: {
  content: StepPedagogicalContent;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="border-moss/15 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-[12px_16px] bg-moss/[.04] hover:bg-moss/[.07] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-[28px] h-[28px] rounded-[7px] bg-moss-light text-moss flex items-center justify-center">
            <BookOpen size={14} />
          </div>
          <div className="text-left">
            <span className="text-[12px] font-bold text-ink">Guide pédagogique</span>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-[10px] text-ink3">
                <Clock size={10} /> {content.estimatedMinutes} min
              </span>
              <span className="flex items-center gap-1 text-[10px] text-ink3">
                <Target size={10} /> {content.subSections.length} sous-sections
              </span>
            </div>
          </div>
        </div>
        {open ? <ChevronUp size={15} className="text-ink3" /> : <ChevronDown size={15} className="text-ink3" />}
      </button>

      {open && (
        <div className="p-[0_16px_16px] space-y-4">
          {content.avantDeLire && (
            <div className="bg-blue-light/20 border border-blue/15 rounded-[10px] p-[12px]">
              <h3 className="text-[11px] font-bold text-blue mb-1 flex items-center gap-1.5">
                <FileText size={12} />
                En bref
              </h3>
              <p className="text-[12px] text-ink2 leading-relaxed">{content.avantDeLire.description}</p>
              {content.avantDeLire.resultatsAttendus && (
                <>
                  <h4 className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em] mt-2 mb-1">Résultats attendus</h4>
                  <p className="text-[12px] text-ink2 leading-relaxed">{content.avantDeLire.resultatsAttendus}</p>
                </>
              )}
            </div>
          )}

          <div>
            <h3 className="text-[11px] font-bold text-ink mb-1 flex items-center gap-1.5">
              <Target size={12} className="text-moss" />
              Objectif d&apos;apprentissage
            </h3>
            <p className="text-[12px] text-ink2 leading-relaxed">{content.objective}</p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-ink mb-1 flex items-center gap-1.5">
              <HelpCircle size={12} className="text-amber-dark" />
              Pourquoi c&apos;est important
            </h3>
            <p className="text-[12px] text-ink2 leading-relaxed">{content.whyImportant}</p>
          </div>

          {content.conseils && content.conseils.length > 0 && (
            <div className="bg-amber-light/20 border border-amber/15 rounded-[10px] p-[12px]">
              <h3 className="text-[11px] font-bold text-amber-dark mb-1 flex items-center gap-1.5">
                <Lightbulb size={12} />
                Conseils
              </h3>
              <ul className="space-y-1">
                {content.conseils.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-ink2">
                    <span className="text-amber-dark mt-0.5 flex-shrink-0">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.keyConcepts.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-ink mb-2">Concepts clés</h3>
              <div className="space-y-1.5">
                {content.keyConcepts.map((kc, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px]">
                    <span className="text-moss font-bold flex-shrink-0 mt-0.5">•</span>
                    <div>
                      <span className="font-semibold text-ink">{kc.term} :</span>
                      <span className="text-ink2"> {kc.definition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.etudeDeCas && (
            <div className="bg-moss-light/30 border border-moss/15 rounded-[10px] p-[12px]">
              <h3 className="text-[11px] font-bold text-moss mb-1 flex items-center gap-1.5">
                <BookOpen size={12} />
                Étude de cas
              </h3>
              <p className="text-[12px] text-ink2 leading-relaxed whitespace-pre-line">{content.etudeDeCas}</p>
            </div>
          )}

          <ChecklistPanel items={content.checklist} />
        </div>
      )}
    </Card>
  );
}
