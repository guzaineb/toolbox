'use client'

import { Field, Input, Select, Textarea } from '@/components/shared/ui'
import type { GbmFieldConfig } from '@/data/gbm/steps'

interface StepFormProps {
  fields: GbmFieldConfig[]
  data: Record<string, unknown>
  onChange: (key: string, value: string | boolean) => void
}

function strValue(data: Record<string, unknown>, key: string): string {
  return typeof data[key] === 'string' ? data[key] : ''
}

export function StepForm({ fields, data, onChange }: StepFormProps) {
  return (
    <div className="space-y-4">
      {fields.map(field => (
        <Field key={field.key} label={field.label}>
          {field.type === 'textarea' ? (
            <Textarea
              value={strValue(data, field.key)}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
          ) : field.type === 'select' ? (
            <Select
              value={strValue(data, field.key)}
              onChange={e => onChange(field.key, e.target.value)}
            >
              <option value="">— Sélectionner —</option>
              {(field.options || []).map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          ) : field.type === 'checkbox' ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(data[field.key])}
                onChange={e => onChange(field.key, e.target.checked)}
                className="w-4 h-4 accent-moss"
              />
              <span className="text-[12px] text-ink2">{field.placeholder || 'Oui'}</span>
            </label>
          ) : (
            <Input
              value={strValue(data, field.key)}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          )}
        </Field>
      ))}
    </div>
  )
}
