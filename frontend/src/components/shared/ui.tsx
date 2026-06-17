'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'secondary' | 'purple'

const badgeVariants: Record<BadgeVariant, string> = {
  green:     'bg-moss-light text-moss border border-moss/20',
  amber:     'bg-amber-light text-amber-dark border border-amber/30',
  red:       'bg-red-light text-red border border-red/20',
  blue:      'bg-blue-light text-blue border border-blue/18',
  gray:      'bg-ink/[.07] text-ink2 border border-ink/[.15]',
  secondary: 'bg-gray-100 text-gray-700 border border-gray-200',
  purple:    'bg-purple-light text-purple border border-purple/20',
}

export function Badge({
  variant = 'gray', children, className,
}: {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.04em] px-[9px] py-[3px] rounded-full',
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────
type BtnVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber' | 'premium'
type BtnSize    = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  BtnVariant
  size?:     BtnSize
  fullWidth?: boolean
  loading?:  boolean
  children:  React.ReactNode
}

const btnBase =
  'inline-flex items-center gap-[6px] border rounded-lg font-semibold font-dm cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-[0.02em] leading-none select-none active:scale-[0.97]'

const btnVariants: Record<BtnVariant, string> = {
  default:   'bg-transparent border-moss/15 text-ink2 hover:bg-moss/5 hover:border-moss/25',
  primary:   'bg-moss border-moss text-white hover:bg-moss-dark shadow-[0_2px_8px_rgba(29,158,117,0.2)] hover:shadow-[0_4px_14px_rgba(29,158,117,0.3)]',
  secondary: 'bg-surface-2 border-border text-ink hover:bg-surface hover:shadow-card',
  outline:   'bg-transparent border-moss/22 text-moss hover:bg-moss-light',
  ghost:     'bg-transparent border-transparent text-ink2 hover:bg-moss/5 hover:border-moss/22',
  danger:    'bg-transparent border-red/25 text-red hover:bg-red-light',
  amber:     'bg-amber border-amber text-ink font-bold',
  premium:   'bg-gradient-to-r from-moss to-accent-mid border-transparent text-white shadow-[0_2px_10px_rgba(29,158,117,0.25)] hover:shadow-[0_4px_16px_rgba(29,158,117,0.35)] hover:brightness-105',
}

const btnSizes: Record<BtnSize, string> = {
  sm: 'text-[11px] px-[12px] py-[6px]',
  md: 'text-[12px] px-[16px] py-[8px]',
  lg: 'text-[13px] px-[20px] py-[10px]',
  xl: 'text-[14px] px-[24px] py-[12px]',
}

export function Button({
  variant = 'default', size = 'md', fullWidth = false,
  loading, className, children, ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading || props.disabled}
      className={cn(
        btnBase,
        btnVariants[variant],
        btnSizes[size],
        fullWidth && 'w-full justify-center',
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 h-[14px] w-[14px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────
type CardElevation = 'flat' | 'sm' | 'md' | 'lg'

export function Card({ children, className, elevation = 'sm', hover = false }: {
  children: React.ReactNode
  className?: string
  elevation?: CardElevation
  hover?: boolean
}) {
  const elevations: Record<CardElevation, string> = {
    flat: '',
    sm: 'shadow-card',
    md: 'shadow-card-hover',
    lg: 'shadow-elevated',
  }

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-[14px] overflow-hidden transition-all duration-200',
        elevations[elevation],
        hover && 'hover:shadow-card-hover hover:border-moss/20',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  icon, title, children, className,
}: {
  icon?: React.ReactNode
  title?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between gap-[9px] px-[18px] py-[13px] border-b border-border bg-surface-2', className)}>
      <div className="flex items-center gap-[9px]">
        {icon && (
          <div className="w-[26px] h-[26px] rounded-[7px] bg-moss-light text-moss flex items-center justify-center text-[13px]">
            {icon}
          </div>
        )}
        {title && (
          <span className="font-syne text-[13px] font-bold text-ink">{title}</span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// GLASS CARD
// ─────────────────────────────────────────────
export function GlassCard({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('glass rounded-[14px] overflow-hidden', className)}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// FIELD / INPUT / SELECT / TEXTAREA
// ─────────────────────────────────────────────
export function Field({
  label, required, children, className, icon,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}) {
  return (
    <div className={cn('mb-[13px]', className)}>
      <label className="flex items-center gap-[4px] text-[11px] font-semibold text-ink2 mb-[4px] tracking-[0.02em]">
        {icon && <span className="text-ink3">{icon}</span>}
        {label}
        {required && <span className="text-red ml-[2px]">*</span>}
      </label>
      {children}
    </div>
  )
}

const fieldBase =
  'w-full font-dm text-[13px] px-[12px] py-[9px] border border-border rounded-lg bg-surface text-ink outline-none transition-all duration-200 focus:border-moss focus:shadow-[0_0_0_3px_rgba(45,122,82,0.09)] focus:bg-white placeholder:text-ink3 disabled:bg-ink/[.03] disabled:text-ink3'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />
}

export function Select({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        fieldBase,
        'cursor-pointer appearance-none pr-[28px]',
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238aab97' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_10px_center]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldBase, 'resize-y min-h-[72px]', className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
// TAB NAV
// ─────────────────────────────────────────────
export function TabNav({
  tabs, active, onChange,
}: {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex gap-[2px] bg-moss/[.06] p-[3px] rounded-[8px] border border-border w-fit mb-[18px]">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'font-dm text-[12px] font-semibold px-[14px] py-[7px] rounded-[6px] cursor-pointer border-none transition-all duration-200',
            active === t.id
              ? 'bg-surface text-moss shadow-[0_1px_4px_rgba(15,31,22,0.08)]'
              : 'bg-transparent text-ink3 hover:text-ink2',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────
export function Avatar({
  initials, size = 'sm', className,
}: {
  initials: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = {
    sm: 'w-[28px] h-[28px] text-[10px]',
    md: 'w-[36px] h-[36px] text-[12px]',
    lg: 'w-[52px] h-[52px] text-[17px]',
    xl: 'w-[64px] h-[64px] text-[22px]',
  }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold flex-shrink-0 bg-moss-light text-moss',
        sizes[size],
        className,
      )}
    >
      {initials}
    </div>
  )
}

// ─────────────────────────────────────────────
// PROGRESS / PROGRESS BAR
// ─────────────────────────────────────────────
export function Progress({ value, animated = true }: { value: number; animated?: boolean }) {
  return (
    <div className="h-[4px] bg-moss/10 rounded-full overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-moss to-accent',
          animated ? 'transition-all duration-700 ease-out' : '',
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function ProgressBar({ value, max = 100, className, animated = true }: {
  value: number
  max?: number
  className?: string
  animated?: boolean
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('h-[3px] bg-moss/12 rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'h-full rounded-full bg-moss',
          animated ? 'transition-all duration-700 ease-out' : '',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────────
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        'relative w-[34px] h-[19px] rounded-[10px] flex-shrink-0 border-none p-0 cursor-pointer transition-all duration-200',
        on ? 'bg-moss shadow-[0_0_0_1px_rgba(29,158,117,0.3)]' : 'bg-moss/18',
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] w-[13px] h-[13px] rounded-full bg-white transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.15)]',
          on ? 'translate-x-[18px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}

// ─────────────────────────────────────────────
// STAT BOX
// ─────────────────────────────────────────────
export function StatBox({ num, label, icon, className }: {
  num: string | number
  label: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-moss/[.05] border border-border rounded-[10px] p-[14px] transition-all duration-200 hover:border-moss/20 hover:shadow-card-hover', className)}>
      <div className="flex items-start justify-between">
        <div className="font-syne text-[26px] font-extrabold text-ink leading-none">{num}</div>
        {icon && <div className="text-moss/60">{icon}</div>}
      </div>
      <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-[3px]">{label}</div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────
export function ErrorAlert({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-[7px] p-[10px_13px] rounded-[8px] bg-red-light border border-red/18 text-red text-[12px]', className)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {message}
    </div>
  )
}

export function SuccessAlert({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-[7px] p-[10px_13px] rounded-[8px] bg-moss/[.08] border border-moss/20 text-moss text-[12px]', className)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      {message}
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION LABEL
// ─────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink3 mb-[10px] pb-[6px] border-b border-border">
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// SEPARATOR
// ─────────────────────────────────────────────
export function Sep({ className }: { className?: string }) {
  return <div className={cn('h-px bg-border my-4', className)} />
}

// ─────────────────────────────────────────────
// SKILL TAG
// ─────────────────────────────────────────────
export function SkillTag({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[11px] px-[10px] py-[4px] rounded-full bg-blue-light text-blue border border-blue/18 m-[2px]',
      onRemove && 'pr-[6px]',
    )}>
      {children}
      {onRemove && (
        <button onClick={onRemove} className="ml-[2px] hover:text-blue-dark transition-colors cursor-pointer">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </span>
  )
}

// ─────────────────────────────────────────────
// UPLOAD ZONE
// ─────────────────────────────────────────────
export function UploadZone({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'border-[1.5px] border-dashed border-moss/25 rounded-[10px] p-[22px] text-center cursor-pointer bg-surface transition-all duration-200 hover:border-moss hover:bg-moss-light',
        className,
      )}
    >
      <div className="text-[22px] mb-[6px] text-moss">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="mx-auto">
          <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        </svg>
      </div>
      <div className="text-[12px] font-semibold text-ink mb-[2px]">Glisser-déposer un fichier</div>
      <div className="text-[11px] text-ink3">PDF, JPG, PNG · Max 10 Mo</div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ADMIN GUARD
// ─────────────────────────────────────────────
export function AdminGuard({ className }: { className?: string }) {
  return (
    <span className={cn('text-[10px] px-[6px] py-[2px] rounded bg-red-light text-red font-bold ml-[6px] align-middle', className)}>
      ADMIN
    </span>
  )
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-r from-ink/[.05] via-ink/[.08] to-ink/[.05] bg-[length:200%_100%] animate-shimmer',
        className,
      )}
    />
  )
}

export function CardSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] space-y-3">
      <Skeleton className="h-5 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === 0 ? 'w-1/2' : 'w-2/3'}`} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={cn(
        'bg-surface rounded-2xl shadow-modal border border-border w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scaleIn',
        className,
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-syne text-[16px] font-bold text-ink">{title}</h2>
            <button onClick={onClose} className="text-ink3 hover:text-ink transition-colors cursor-pointer p-1 rounded-lg hover:bg-ink/[.05]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// TOOLTIP
// ─────────────────────────────────────────────
export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-ink text-white text-[11px] font-medium whitespace-nowrap shadow-elevated z-50 animate-fadeIn pointer-events-none">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-ink rotate-45 -mt-1" />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-moss-light text-moss flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-syne text-[18px] font-bold text-ink mb-2">{title}</h3>
      <p className="text-[13px] text-ink3 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  )
}

// ─────────────────────────────────────────────
// LOADING SPINNER
// ─────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-3">
        <div className={cn('w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin', className)} />
        <p className="text-ink2 text-sm font-medium">Chargement...</p>
      </div>
    </div>
  )
}
