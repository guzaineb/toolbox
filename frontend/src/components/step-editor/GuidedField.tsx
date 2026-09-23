'use client';

import { Input, Textarea, Select, Field } from '@/components/shared/ui';
import { GuidedQuestion } from '@/data/pedagogical-content';
import { SWOTAnalysis } from './SWOTAnalysis';
import { PESTELAnalysis } from './PESTELAnalysis';
import { PESTELAnalysisV2 } from './PESTELAnalysisV2';
import { StakeholderMatrix } from './StakeholderMatrix';
import { CustomerSegmentCard } from './CustomerSegmentCard';
import { ValuePropositionCanvas } from './ValuePropositionCanvas';
import { DiscoveryCard } from './DiscoveryCard';
import { BMCEditor } from './BMCEditor';
import { StepRecapField } from './StepRecapField';

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

  if (question.type === 'pestel_v2') {
    return (
      <PESTELAnalysisV2
        label={question.question}
        hint={question.hint}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (question.type === 'stakeholder_matrix') {
    return (
      <StakeholderMatrix
        label={question.question}
        hint={question.hint}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (question.type === 'customer_segment') {
    return (
      <CustomerSegmentCard
        label={question.question}
        hint={question.hint}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (question.type === 'value_proposition') {
    return (
      <ValuePropositionCanvas
        label={question.question}
        hint={question.hint}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (question.type === 'discovery_card') {
    return (
      <DiscoveryCard
        label={question.question}
        hint={question.hint}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (question.type === 'step_recap') {
    return (
      <StepRecapField
        label={question.question}
        value={value || ''}
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
