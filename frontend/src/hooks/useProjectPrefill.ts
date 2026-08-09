import { useQuery } from '@tanstack/react-query'
import type { ModulePrefill, PrefillField } from '@/types/project-context'
import { projectContextService } from '@/services/project-context.service'

export function useProjectPrefill(projectId?: string, module?: string) {
  return useQuery<ModulePrefill>({
    queryKey: ['project', 'prefill', projectId, module],
    queryFn: () => projectContextService.getPrefill(projectId!, module!),
    enabled: !!projectId && !!module,
    staleTime: 60_000,
  })
}

export interface ProvenanceInfo {
  sourceModule: string
  sourceLabel: string
  preview: string
  applied: boolean
}

export interface ApplyPrefillResult {
  data: Record<string, unknown>
  provenance: Record<string, ProvenanceInfo>
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value as object).length === 0
  return false
}

export function applyPrefill(
  record: unknown,
  prefill: ModulePrefill | null | undefined,
): ApplyPrefillResult {
  const data: Record<string, unknown> = {}
  if (record && typeof record === 'object') {
    for (const [key, value] of Object.entries(record)) data[key] = value
  }
  const provenance: Record<string, ProvenanceInfo> = {}

  if (!prefill) return { data, provenance }

  for (const [key, field] of Object.entries(prefill.fields as Record<string, PrefillField>)) {
    const existing = data[key]
    const applied = isEmptyValue(existing)
    if (applied) {
      data[key] = field.value
    }
    provenance[key] = {
      sourceModule: field.sourceModule,
      sourceLabel: field.sourceLabel,
      preview: field.preview,
      applied,
    }
  }
  return { data, provenance }
}
