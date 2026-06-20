'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Textarea, Button, Select } from '@/components/shared/ui';
import { CustomerSegmentCard as CustomerSegmentCardType } from '@/types/switchers';

interface CustomerSegmentCardProps {
  label: string;
  hint?: string;
  value: CustomerSegmentCardType[];
  onChange: (value: CustomerSegmentCardType[]) => void;
}

const emptyCard = (): CustomerSegmentCardType => ({
  name: '',
  description: '',
  pains: [''],
  gains: [''],
  jobs: [''],
  archetype: '',
});

const ARCHETYPE_OPTIONS = [
  'End-user',
  'Decision-maker',
  'Influencer',
  'Economic buyer',
  'Technical buyer',
  'Recommender',
  'Saboteur',
  'Champion',
];

function ListField({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const safe = items || [];
  return (
    <div className="space-y-1.5">
      {safe.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <Input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[idx] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder || '...'}
            className="text-[12px] px-[10px] py-[6px] flex-1"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="text-ink3 hover:text-red transition-colors p-1 flex-shrink-0"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="text-[11px] text-moss font-semibold flex items-center gap-1 mt-1 hover:text-moss-dark transition-colors"
      >
        <Plus size={12} />
        Ajouter
      </button>
    </div>
  );
}

const CARD_COLORS = [
  { bg: 'bg-blue-light/30', border: 'border-blue/15' },
  { bg: 'bg-moss-light/30', border: 'border-moss/15' },
  { bg: 'bg-amber-light/30', border: 'border-amber/20' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { bg: 'bg-purple-light/30', border: 'border-purple/20' },
];

const SECTION_COLORS = {
  pains: { label: 'text-red', dot: 'bg-red' },
  gains: { label: 'text-moss', dot: 'bg-moss' },
  jobs: { label: 'text-blue', dot: 'bg-blue' },
};

export function CustomerSegmentCard({
  label, hint, value, onChange,
}: CustomerSegmentCardProps) {
  const [expanded, setExpanded] = useState(true);

  const cards = Array.isArray(value) ? value : [];

  const updateCard = (index: number, patch: Partial<CustomerSegmentCardType>) => {
    const next = cards.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange(next);
  };

  const removeCard = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  const addCard = () => {
    onChange([...cards, emptyCard()]);
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
          {cards.length > 0 && (
            <span className="text-[10px] text-ink3 bg-ink/[.06] px-[7px] py-[2px] rounded-full font-semibold">
              {cards.length}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-ink3" /> : <ChevronDown size={14} className="text-ink3" />}
      </button>

      {hint && !expanded && (
        <p className="text-[11px] text-ink3 px-[16px] pb-[8px] italic">{hint}</p>
      )}

      {expanded && (
        <div className="p-[12px] space-y-3">
          {hint && (
            <p className="text-[11px] text-ink3 italic">{hint}</p>
          )}

          {cards.length === 0 && (
            <p className="text-[12px] text-ink3 text-center py-6">
              Aucun segment client défini.
            </p>
          )}

          {cards.map((card, ci) => {
            const colors = CARD_COLORS[ci % CARD_COLORS.length];
            return (
              <div
                key={ci}
                className={cn('rounded-[10px] border p-[14px]', colors.bg, colors.border)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center text-[12px] bg-moss-light/50 text-moss">
                      <User size={13} />
                    </div>
                    <span className="text-[11px] font-bold text-ink uppercase tracking-[0.04em]">
                      Segment #{ci + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCard(ci)}
                    className="text-ink3 hover:text-red transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] text-ink3 block mb-0.5 font-semibold">Nom</label>
                    <Input
                      value={card.name}
                      onChange={(e) => updateCard(ci, { name: e.target.value })}
                      placeholder="Ex: Jeunes entrepreneurs"
                      className="text-[12px] px-[10px] py-[6px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-ink3 block mb-0.5 font-semibold">Description</label>
                    <Textarea
                      value={card.description}
                      onChange={(e) => updateCard(ci, { description: e.target.value })}
                      placeholder="Décrivez ce segment..."
                      className="text-[12px] px-[10px] py-[6px] min-h-[60px]"
                    />
                  </div>

                  <div>
                    <label className={cn('text-[10px] font-semibold block mb-1', SECTION_COLORS.pains.label)}>
                      <span className="inline-block w-[6px] h-[6px] rounded-full bg-red mr-1.5 align-middle" />
                      Pains (difficultés)
                    </label>
                    <ListField
                      items={card.pains}
                      onChange={(items) => updateCard(ci, { pains: items })}
                      placeholder="Ex: Manque de financement"
                    />
                  </div>

                  <div>
                    <label className={cn('text-[10px] font-semibold block mb-1', SECTION_COLORS.gains.label)}>
                      <span className="inline-block w-[6px] h-[6px] rounded-full bg-moss mr-1.5 align-middle" />
                      Gains (bénéfices recherchés)
                    </label>
                    <ListField
                      items={card.gains}
                      onChange={(items) => updateCard(ci, { gains: items })}
                      placeholder="Ex: Accès à un réseau"
                    />
                  </div>

                  <div>
                    <label className={cn('text-[10px] font-semibold block mb-1', SECTION_COLORS.jobs.label)}>
                      <span className="inline-block w-[6px] h-[6px] rounded-full bg-blue mr-1.5 align-middle" />
                      Jobs (tâches à accomplir)
                    </label>
                    <ListField
                      items={card.jobs}
                      onChange={(items) => updateCard(ci, { jobs: items })}
                      placeholder="Ex: Trouver des fournisseurs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-ink3 block mb-0.5 font-semibold">Archétype</label>
                    <Select
                      value={card.archetype || ''}
                      onChange={(e) => updateCard(ci, { archetype: e.target.value })}
                      className="text-[12px] px-[10px] py-[6px]"
                    >
                      <option value="">Sélectionner un archétype...</option>
                      {ARCHETYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            fullWidth
            onClick={addCard}
          >
            <Plus size={14} />
            Ajouter un segment client
          </Button>
        </div>
      )}
    </div>
  );
}
