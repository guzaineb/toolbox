'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchAutocompleteProps<T extends { id: string }> {
  onSearch: (query: string) => Promise<T[]>
  onSelect: (item: T) => void
  renderOption: (item: T) => React.ReactNode
  renderSelected?: (item: T) => React.ReactNode
  placeholder?: string
  className?: string
}

export function SearchAutocomplete<T extends { id: string }>({
  onSearch,
  onSelect,
  renderOption,
  renderSelected,
  placeholder = 'Rechercher...',
  className,
}: SearchAutocompleteProps<T>) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<T | null>(null)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (value.trim().length === 0) {
        setResults([])
        setIsOpen(false)
        return
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true)
        try {
          const data = await onSearch(value)
          setResults(data)
          setIsOpen(data.length > 0)
          setHighlightIndex(-1)
        } catch {
          setResults([])
        } finally {
          setLoading(false)
        }
      }, 300)
    },
    [onSearch],
  )

  const handleSelect = (item: T) => {
    setSelected(item)
    setQuery('')
    setResults([])
    setIsOpen(false)
    onSelect(item)
  }

  const handleClear = () => {
    setSelected(null)
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault()
      handleSelect(results[highlightIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (selected) {
    return (
      <div className={cn('relative', className)}>
        <div className="flex items-center gap-2 w-full font-dm text-[13px] px-[12px] py-[9px] border border-moss/30 rounded-lg bg-moss-light text-ink">
          <div className="flex-1 min-w-0">
            {renderSelected ? renderSelected(selected) : <span>{selected.id}</span>}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-1 rounded hover:bg-white/50 text-ink3 hover:text-ink transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search size={14} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-ink3" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            handleSearch(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          className="w-full font-dm text-[13px] pl-[34px] pr-[12px] py-[9px] border border-border rounded-lg bg-surface text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-moss focus:shadow-[0_0_0_3px_rgba(45,122,82,0.09)] placeholder:text-ink3"
        />
        {loading && (
          <div className="absolute right-[12px] top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-[240px] overflow-y-auto">
          {results.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className={cn(
                'w-full text-left px-[12px] py-[10px] text-[12px] border-b border-border last:border-b-0 transition-colors cursor-pointer',
                highlightIndex === index
                  ? 'bg-moss-light text-moss'
                  : 'hover:bg-surface-2 text-ink',
              )}
            >
              {renderOption(item)}
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim().length > 0 && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg p-4 text-center text-[12px] text-ink3">
          Aucun résultat pour « {query} »
        </div>
      )}
    </div>
  )
}
