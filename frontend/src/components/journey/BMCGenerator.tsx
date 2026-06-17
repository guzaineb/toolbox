'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BmcSnapshot, BmcBlocks } from '@/types/project'
import { Badge, Button } from '@/components/shared/ui'
import { Leaf, Sparkles, Save, RotateCcw } from 'lucide-react'

interface BMCGeneratorProps {
  snapshot: BmcSnapshot | null
  history: BmcSnapshot[]
  isGreen: boolean
  onToggleGreen: (green: boolean) => void
  onUpdateBlocks: (blocks: Partial<BmcBlocks>) => void
  onRegenerate: () => void
  loading?: boolean
}

const STANDARD_BLOCKS: { key: keyof BmcBlocks; label: string; col: number; row: number; colSpan?: number; rowSpan?: number }[] = [
  { key: 'key_partners', label: 'Partenaires clés', col: 1, row: 1, rowSpan: 2 },
  { key: 'key_activities', label: 'Activités clés', col: 2, row: 1 },
  { key: 'key_resources', label: 'Ressources clés', col: 2, row: 2 },
  { key: 'value_proposition', label: 'Proposition de valeur', col: 3, row: 1, rowSpan: 2 },
  { key: 'customer_relations', label: 'Relation client', col: 4, row: 1 },
  { key: 'channels', label: 'Canaux', col: 4, row: 2 },
  { key: 'customer_segments', label: 'Segments clients', col: 5, row: 1, rowSpan: 2 },
  { key: 'cost_structure', label: 'Structure de coûts', col: 1, row: 3, colSpan: 2 },
  { key: 'revenue_streams', label: 'Flux de revenus', col: 4, row: 3, colSpan: 2 },
]

const GREEN_BLOCKS: { key: keyof BmcBlocks; label: string; color: string }[] = [
  { key: 'environmental_impact', label: 'Impact environnemental', color: 'bg-emerald-50 border-emerald-200' },
  { key: 'social_impact', label: 'Impact social', color: 'bg-blue-50 border-blue-200' },
  { key: 'circular_economy', label: 'Économie circulaire', color: 'bg-teal-50 border-teal-200' },
  { key: 'sdg_goals', label: 'Objectifs de développement durable', color: 'bg-purple-50 border-purple-200' },
]

const BLOCK_LABELS: Record<string, string> = {
  customer_segments: 'Segments clients',
  value_proposition: 'Proposition de valeur',
  channels: 'Canaux',
  customer_relations: 'Relation client',
  revenue_streams: 'Flux de revenus',
  key_resources: 'Ressources clés',
  key_activities: 'Activités clés',
  key_partners: 'Partenaires clés',
  cost_structure: 'Structure de coûts',
  environmental_impact: 'Impact environnemental',
  social_impact: 'Impact social',
  circular_economy: 'Économie circulaire',
  sdg_goals: 'Objectifs de développement durable',
}

export function BMCGenerator({
  snapshot, history, isGreen, onToggleGreen, onUpdateBlocks, onRegenerate, loading,
}: BMCGeneratorProps) {
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const blocks = snapshot?.blocks

  const handleStartEdit = (key: string, value: string) => {
    setEditingBlock(key)
    setEditValue(value)
  }

  const handleSaveEdit = () => {
    if (editingBlock && blocks) {
      onUpdateBlocks({ [editingBlock]: editValue } as Partial<BmcBlocks>)
    }
    setEditingBlock(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingBlock(null)
    setEditValue('')
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleGreen(false)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                !isGreen
                  ? 'bg-moss text-white shadow-sm'
                  : 'bg-surface border border-border text-ink2 hover:bg-moss/[.04]',
              )}
            >
              BMC Standard
            </button>
            <button
              onClick={() => onToggleGreen(true)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                isGreen
                  ? 'bg-emerald text-white shadow-sm'
                  : 'bg-surface border border-border text-ink2 hover:bg-moss/[.04]',
              )}
            >
              <Leaf size={12} />
              BMC Green
            </button>
          </div>
          {snapshot?.is_auto_generated && (
            <Badge variant="purple">
              <Sparkles size={10} />
              Généré automatiquement
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {snapshot?.created_at && (
            <span className="text-[10px] text-ink3">
              Généré le {new Date(snapshot.created_at).toLocaleDateString('fr-FR')}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onRegenerate} loading={loading}>
            <RotateCcw size={12} /> Régénérer
          </Button>
        </div>
      </div>

      {/* BMC Canvas */}
      <div className="bg-surface border border-border rounded-[14px] overflow-hidden shadow-card">
        {/* Canvas grid */}
        <div
          className="grid gap-px bg-border"
          style={{
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'auto auto auto',
          }}
        >
          {STANDARD_BLOCKS.map((block) => {
            const value = blocks ? String(blocks[block.key] || '') : ''
            const isEditing = editingBlock === block.key

            return (
              <div
                key={block.key}
                className="bg-surface p-3 min-h-[120px] flex flex-col"
                style={{
                  gridColumn: `${block.col} / span ${block.colSpan || 1}`,
                  gridRow: `${block.row} / span ${block.rowSpan || 1}`,
                }}
              >
                <span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-ink3 mb-1.5">
                  {block.label}
                </span>
                {isEditing ? (
                  <div className="flex flex-col gap-1.5 flex-1">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 w-full text-[11px] px-2 py-1.5 border border-moss rounded-md bg-moss-light/20 outline-none resize-none min-h-[60px] font-dm"
                      autoFocus
                    />
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={handleSaveEdit}
                        className="text-[10px] px-2 py-1 rounded bg-moss text-white font-semibold hover:bg-moss-dark transition-colors"
                      >
                        <Save size={10} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-[10px] px-2 py-1 rounded bg-border text-ink3 font-semibold hover:bg-ink/[.12] transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleStartEdit(block.key, value)}
                    className="flex-1 cursor-text text-[11px] text-ink leading-relaxed whitespace-pre-wrap font-dm"
                  >
                    {value || (
                      <span className="text-ink3 italic">Cliquez pour éditer...</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Green extras */}
      {isGreen && (
        <div className="grid grid-cols-2 gap-3">
          {GREEN_BLOCKS.map((block) => {
            const value = blocks ? String(blocks[block.key] || '') : ''
            const isEditing = editingBlock === block.key

            return (
              <div key={block.key} className={cn('rounded-[10px] border p-3', block.color)}>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-ink3 mb-1.5 block">
                  {block.label}
                </span>
                {isEditing ? (
                  <div className="flex flex-col gap-1.5">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full text-[11px] px-2 py-1.5 border border-moss rounded-md bg-white outline-none resize-none min-h-[50px] font-dm"
                      autoFocus
                    />
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={handleSaveEdit}
                        className="text-[10px] px-2 py-1 rounded bg-moss text-white font-semibold hover:bg-moss-dark transition-colors"
                      >
                        <Save size={10} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-[10px] px-2 py-1 rounded bg-border text-ink3 font-semibold hover:bg-ink/[.12] transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleStartEdit(block.key, value)}
                    className="cursor-text text-[11px] text-ink leading-relaxed whitespace-pre-wrap font-dm min-h-[40px]"
                  >
                    {value || (
                      <span className="text-ink3 italic">Cliquez pour éditer...</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <details className="group">
          <summary className="text-[11px] font-semibold text-ink3 cursor-pointer hover:text-ink transition-colors list-none flex items-center gap-1.5">
            <span className="text-[9px]">▶</span>
            Historique des générations ({history.length})
          </summary>
          <div className="mt-2 space-y-1.5">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-2 border border-border text-[11px]"
              >
                <div className="flex items-center gap-2">
                  {h.is_green && <Leaf size={10} className="text-emerald" />}
                  <span className="text-ink2 font-medium">
                    {new Date(h.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  {h.is_auto_generated && (
                    <Badge variant="purple" className="text-[8px]">
                      <Sparkles size={8} /> Auto
                    </Badge>
                  )}
                  {h.id === snapshot?.id && (
                    <Badge variant="green">Actuel</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
