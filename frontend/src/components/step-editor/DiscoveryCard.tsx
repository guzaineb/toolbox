'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, ListPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Textarea, Button, Select, Field } from '@/components/shared/ui';
import type { DiscoveryCard as DiscoveryCardType } from '@/types/switchers';

const DISCOVERY_TYPES = [
  { value: 'interview', label: 'Entretien' },
  { value: 'observation', label: 'Observation' },
  { value: 'survey', label: 'Sondage' },
] as const;

const LABELS: Record<string, string> = {
  interview: 'Entretien',
  observation: 'Observation',
  survey: 'Sondage',
};

interface DiscoveryCardProps {
  label: string;
  hint?: string;
  value: DiscoveryCardType[];
  onChange: (value: DiscoveryCardType[]) => void;
}

function emptyCard(): DiscoveryCardType {
  return {
    type: 'interview',
    date: '',
    person: '',
    hypothesisTested: '',
    keyFindings: '',
    insights: '',
    actionItems: [],
  };
}

export function DiscoveryCard({ label, hint, value, onChange }: DiscoveryCardProps) {
  const [expanded, setExpanded] = useState(true);
  const cards = value ?? [];

  const updateCard = (index: number, partial: Partial<DiscoveryCardType>) => {
    const next = cards.map((c, i) => (i === index ? { ...c, ...partial } : c));
    onChange(next);
  };

  const addCard = () => {
    onChange([...cards, emptyCard()]);
  };

  const removeCard = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  const safeItems = (card: DiscoveryCardType): string[] => card.actionItems || [];

  const addActionItem = (cardIndex: number) => {
    const card = cards[cardIndex];
    updateCard(cardIndex, { actionItems: [...safeItems(card), ''] });
  };

  const updateActionItem = (cardIndex: number, itemIndex: number, value: string) => {
    const card = cards[cardIndex];
    const items = safeItems(card).map((it, i) => (i === itemIndex ? value : it));
    updateCard(cardIndex, { actionItems: items });
  };

  const removeActionItem = (cardIndex: number, itemIndex: number) => {
    const card = cards[cardIndex];
    updateCard(cardIndex, { actionItems: safeItems(card).filter((_, i) => i !== itemIndex) });
  };

  return (
    <div className="border border-border rounded-[12px] overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-[12px_16px] bg-moss/[.04] hover:bg-moss/[.07] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-ink uppercase tracking-[0.04em]">{label}</span>
          {cards.length > 0 && !expanded && (
            <span className="text-[10px] text-ink3 font-medium">
              {cards.length} fiche{cards.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-ink3" /> : <ChevronDown size={14} className="text-ink3" />}
      </button>

      {hint && !expanded && (
        <p className="text-[11px] text-ink3 px-[16px] pb-[8px] italic">{hint}</p>
      )}

      {expanded && (
        <div className="p-[12px]">
          {hint && (
            <p className="text-[11px] text-ink3 mb-3 italic">{hint}</p>
          )}

          {cards.length === 0 && (
            <p className="text-[12px] text-ink3 text-center py-6">
              Aucune fiche de découverte. Ajoutez-en une ci-dessous.
            </p>
          )}

          <div className="space-y-3">
            {cards.map((card, ci) => (
              <div
                key={ci}
                className="rounded-[10px] border border-border bg-surface-2 p-[12px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-ink2">
                    Fiche #{ci + 1}
                    {card.type && (
                      <span className="ml-2 text-moss">· {LABELS[card.type]}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCard(ci)}
                    className="text-ink3 hover:text-red transition-colors p-1"
                    title="Supprimer cette fiche"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type">
                    <Select
                      value={card.type}
                      onChange={(e) => updateCard(ci, { type: e.target.value as DiscoveryCardType['type'] })}
                      className="text-[12px] px-[10px] py-[6px]"
                    >
                      {DISCOVERY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Date">
                    <Input
                      type="date"
                      value={card.date}
                      onChange={(e) => updateCard(ci, { date: e.target.value })}
                      className="text-[12px] px-[10px] py-[6px]"
                    />
                  </Field>
                </div>

                <Field label="Personne rencontrée / observée">
                  <Input
                    value={card.person}
                    onChange={(e) => updateCard(ci, { person: e.target.value })}
                    placeholder="Nom, rôle, organisation..."
                    className="text-[12px] px-[10px] py-[6px]"
                  />
                </Field>

                <Field label="Hypothèse testée">
                  <Textarea
                    value={card.hypothesisTested}
                    onChange={(e) => updateCard(ci, { hypothesisTested: e.target.value })}
                    placeholder="Quelle hypothèse cette fiche permet-elle de valider ou d'infirmer ?"
                    className="text-[12px] px-[10px] py-[6px] min-h-[60px]"
                  />
                </Field>

                <Field label="Résultats clés">
                  <Textarea
                    value={card.keyFindings}
                    onChange={(e) => updateCard(ci, { keyFindings: e.target.value })}
                    placeholder="Ce que vous avez appris de concret..."
                    className="text-[12px] px-[10px] py-[6px] min-h-[60px]"
                  />
                </Field>

                <Field label="Insights">
                  <Textarea
                    value={card.insights}
                    onChange={(e) => updateCard(ci, { insights: e.target.value })}
                    placeholder="Interprétations, implications, nouvelles questions..."
                    className="text-[12px] px-[10px] py-[6px] min-h-[60px]"
                  />
                </Field>

                <Field label="Actions à mener">
                  <div className="space-y-1.5">
                    {safeItems(card).map((item, ai) => (
                      <div key={ai} className="flex items-center gap-1.5">
                        <Input
                          value={item}
                          onChange={(e) => updateActionItem(ci, ai, e.target.value)}
                          placeholder={`Action ${ai + 1}...`}
                          className="text-[12px] px-[10px] py-[6px] flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeActionItem(ci, ai)}
                          className="text-ink3 hover:text-red transition-colors p-1 flex-shrink-0"
                          title="Retirer cette action"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addActionItem(ci)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-moss hover:text-moss-dark transition-colors mt-1"
                    >
                      <ListPlus size={13} />
                      Ajouter une action
                    </button>
                  </div>
                </Field>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCard}
            >
              <Plus size={14} />
              Ajouter une fiche de découverte
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
