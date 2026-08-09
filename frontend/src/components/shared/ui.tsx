import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────
// LOADING STATES
// ─────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      aria-label="Chargement"
      className={cn('h-4 w-4 rounded-full border-2 border-moss/25 border-t-moss animate-spin', className)}
    />
  )
}

export function LoadingState({ label = 'Chargement…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-[10px] py-[48px] text-ink3', className)}>
      <div className="h-[26px] w-[26px] rounded-full border-[3px] border-moss/20 border-t-moss animate-spin" />
      <span className="text-[12px] font-semibold">{label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'secondary'

const badgeVariants: Record<BadgeVariant, string> = {
  green:     'bg-moss-light text-moss border border-moss/20',
  amber:     'bg-amber-light text-amber-dark border border-amber/30',
  red:       'bg-red-light text-red border border-red/20',
  blue:      'bg-blue-light text-blue border border-blue/18',
  gray:      'bg-ink/[.07] text-ink2 border border-ink/[.15]',
  secondary: 'bg-gray-100 text-gray-700 border border-gray-200',
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
type BtnVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber'
type BtnSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  BtnVariant
  size?:     BtnSize
  fullWidth?: boolean
  loading?:  boolean
  children:  React.ReactNode
}

const btnBase =
  'inline-flex items-center gap-[5px] border rounded-lg font-semibold font-dm cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed tracking-[0.02em] leading-none'

const btnVariants: Record<BtnVariant, string> = {
  default:   'bg-transparent border-moss/15 text-ink2 hover:bg-moss/5 hover:border-moss/25',
  primary:   'bg-moss border-moss text-white hover:bg-moss-mid',
  secondary: 'bg-surface-2 border-border text-ink hover:bg-surface',
  outline:   'bg-transparent border-moss/22 text-moss hover:bg-moss-light',
  ghost:     'bg-transparent border-moss/15 text-ink2 hover:bg-moss/5 hover:border-moss/22',
  danger:    'bg-transparent border-red/25 text-red hover:bg-red-light',
  amber:     'bg-amber border-amber text-ink font-bold',
}

const btnSizes: Record<BtnSize, string> = {
  sm: 'text-[11px] px-[11px] py-[6px]',
  md: 'text-[12px] px-[15px] py-[8px]',
  lg: 'text-[13px] px-[18px] py-[10px]',
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
      {loading ? 'Chargement…' : children}
    </button>
  )
}

// ─────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────
export function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={cn('bg-surface border border-border rounded-[14px] shadow-sm overflow-hidden', className)} onClick={onClick}>
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
  'w-full font-dm text-[13px] px-[12px] py-[9px] border border-border rounded-lg bg-surface text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-moss focus:shadow-[0_0_0_3px_rgba(45,122,82,0.09)] placeholder:text-ink3'

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
            'font-dm text-[12px] font-semibold px-[14px] py-[7px] rounded-[6px] cursor-pointer border-none transition-all duration-150',
            active === t.id
              ? 'bg-surface text-moss shadow-[0_1px_4px_rgba(15,31,22,0.08)]'
              : 'bg-transparent text-ink3',
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
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    sm: 'w-[28px] h-[28px] text-[10px]',
    md: 'w-[36px] h-[36px] text-[12px]',
    lg: 'w-[52px] h-[52px] text-[17px]',
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
export function Progress({ value }: { value: number }) {
  return (
    <div className="h-[4px] bg-moss/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-moss to-accent transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export function ProgressBar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('h-[3px] bg-moss/12 rounded-full overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-moss transition-[width] duration-500"
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
        'relative w-[34px] h-[19px] rounded-[10px] flex-shrink-0 border-none p-0 cursor-pointer transition-colors duration-200',
        on ? 'bg-moss' : 'bg-moss/18',
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] w-[13px] h-[13px] rounded-full bg-white transition-transform duration-200',
          on ? 'translate-x-[18px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}

// ─────────────────────────────────────────────
// STAT BOX
// ─────────────────────────────────────────────
export function StatBox({ num, label }: { num: string | number; label: string }) {
  return (
    <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px]">
      <div className="font-syne text-[26px] font-extrabold text-ink leading-none">{num}</div>
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
export function SkillTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-[10px] py-[4px] rounded-full bg-blue-light text-blue border border-blue/18 m-[2px]">
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────
// UPLOAD ZONE
// ─────────────────────────────────────────────
export function UploadZone({ onClick }: { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="border-[1.5px] border-dashed border-moss/25 rounded-[10px] p-[22px] text-center cursor-pointer bg-surface transition-all duration-200 hover:border-moss hover:bg-moss-light"
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