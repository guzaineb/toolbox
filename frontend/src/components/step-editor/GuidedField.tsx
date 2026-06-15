'use client';

import { Input, Textarea, Select, Field } from '@/components/shared/ui';
import { GuidedQuestion } from '@/data/pedagogical-content';
import { SWOTAnalysis } from './SWOTAnalysis';
import { PESTELAnalysis } from './PESTELAnalysis';
import { BMCEditor } from './BMCEditor';

export function GuidedField({
  question, value, onChange, depth = 0,
}: {
  question: GuidedQuestion;
  value: any;
  onChange: (value: any) => void;
  depth?: number;
}) {
  const id = question.question.replace(/\s+/g, '-').toLowerCase();

  if (question.type === 'swot') {
    return (
      <SWOTAnalysis
        label={question.question}
        hint={question.hint}
        value={value}
        onChange={onChange}
        subQuestions={question.subQuestions}
      />
    );
  }

  if (question.type === 'pestel') {
    return (
      <PESTELAnalysis
        label={question.question}
        hint={question.hint}
        value={value}
        onChange={onChange}
        subQuestions={question.subQuestions}
      />
    );
  }

  if (question.type === 'bmc') {
    return (
      <BMCEditor
        label={question.question}
        hint={question.hint}
        value={value}
        onChange={onChange}
        subQuestions={question.subQuestions}
      />
    );
  }

  if (question.type === 'select' && question.options) {
    return (
      <Field label={question.question} className={depth > 0 ? 'ml-4' : ''}>
        {question.hint && (
          <p className="text-[11px] text-ink3 mb-2 italic">{question.hint}</p>
        )}
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Sélectionnez une option...</option>
          {question.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </Field>
    );
  }

  if (question.type === 'number') {
    return (
      <Field label={question.question} className={depth > 0 ? 'ml-4' : ''}>
        {question.hint && (
          <p className="text-[11px] text-ink3 mb-2 italic">{question.hint}</p>
        )}
        <Input
          id={id}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
        />
      </Field>
    );
  }

  if (question.type === 'textarea') {
    return (
      <Field label={question.question} className={depth > 0 ? 'ml-4' : ''}>
        {question.hint && (
          <p className="text-[11px] text-ink3 mb-2 italic">{question.hint}</p>
        )}
        <Textarea
          id={id}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
        />
      </Field>
    );
  }

  return (
    <Field label={question.question} className={depth > 0 ? 'ml-4' : ''}>
      {question.hint && (
        <p className="text-[11px] text-ink3 mb-2 italic">{question.hint}</p>
      )}
      <Input
        id={id}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
      />
    </Field>
  );
}
