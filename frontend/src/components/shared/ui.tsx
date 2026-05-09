import { cn } from '@/lib/utils'

// ---- BADGE ----
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'secondary';

const badgeVariants: Record<BadgeVariant, string> = {
  green: 'bg-accent-light text-accent',
  amber: 'bg-amber-light text-amber',
  red: 'bg-red-light text-red',
  blue: 'bg-blue-light text-blue',
  gray: 'bg-bg text-text-2 border border-border',
  secondary: 'bg-gray-100 text-gray-700 border border-gray-200',
};

export function Badge({ variant = 'gray', children, className }: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full', badgeVariants[variant], className)}>
      {children}
    </span>
  );
}

// ---- ADMIN GUARD ----
export function AdminGuard({ className }: { className?: string }) {
  return (
    <span className={cn('text-[10px] px-1.5 py-0.5 rounded bg-red-light text-red font-semibold ml-1.5 align-middle', className)}>
      ADMIN
    </span>
  )
}

// ---- BUTTON ----
type BtnVariant = 'default' | 'primary' |'secondary' |'outline' | 'ghost' | 'danger'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  fullWidth?: boolean
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'; 
}
// Ajoute "loading" au Button
export function Button({ variant = 'default', fullWidth = false, className, children, loading, ...props }: ButtonProps & { loading?: boolean }) {
  return (
    <button
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-sm text-[13px] font-medium cursor-pointer border transition-all duration-150 disabled:opacity-50',
        variant === 'primary' && 'border-accent bg-accent text-white hover:bg-accent-mid',
        fullWidth && 'w-full justify-center',
        className
      )}
      {...props}
    >
      {loading ? "Chargement..." : children}
    </button>
  )
}
export function ErrorAlert({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn("p-3 rounded bg-red-light text-red text-[13px] border border-red/10", className)}>
      {message}
    </div>
  )
}
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-surface border border-border rounded p-6 shadow-sm', className)}>
      {children}
    </div>
  )
}
export function Field({ label, children, className, required }: { 
  label: string; 
  children: React.ReactNode; 
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn('mb-[14px]', className)}>
      <label className="block text-[12px] font-medium text-text-2 mb-[5px]">
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

export function Input({className, ...props}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full px-3 py-[9px] border border-border rounded-sm bg-surface text-text text-[14px] outline-none transition-colors focus:border-accent"
      {...props}
    />
  )
}
export function Select({ children,className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="w-full px-3 py-[9px] border border-border rounded-sm bg-surface text-text text-[14px] outline-none transition-colors focus:border-accent"
      {...props}
    >
      {children}
    </select>
  )
}
export function Textarea({className, ...props}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full px-3 py-[9px] border border-border rounded-sm bg-surface text-text text-[14px] outline-none transition-colors focus:border-accent resize-y min-h-[80px]"
      {...props}
    />
  )
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="h-1 bg-border rounded-sm overflow-hidden">
      <div
        className="h-full bg-accent rounded-sm transition-all duration-400"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
export function ProgressBar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("h-1 bg-border rounded-sm overflow-hidden", className)}>
      <div
        className="h-full bg-accent rounded-sm transition-all duration-400"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative w-[34px] h-[19px] rounded-[10px] flex-shrink-0 transition-colors duration-200',
        on ? 'bg-accent' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] w-[13px] h-[13px] rounded-full bg-white transition-transform duration-200',
          on ? 'translate-x-[18px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  )
}

export function Avatar({ initials, bg = 'bg-accent-light', color = 'text-accent', size = 'sm' }: {
  initials: string
  bg?: string
  color?: string
  size?: 'sm' | 'lg'
}) {
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
      bg, color,
      size === 'sm' ? 'w-[30px] h-[30px] text-[11px]' : 'w-14 h-14 text-[18px]'
    )}>
      {initials}
    </div>
  )
}

// ---- STAT BOX ----
export function StatBox({ num, label }: { num: string | number; label: string }) {
  return (
    <div className="bg-bg rounded-sm p-[14px]">
      <div className="text-[26px] font-semibold text-text leading-none">{num}</div>
      <div className="text-[11px] text-text-2 mt-1">{label}</div>
    </div>
  )
}

// ---- SEPARATOR ----
export function Sep() {
  return <div className="h-px bg-border my-5" />
}

// ---- SKILL TAG ----
export function SkillTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-full bg-blue-light text-blue border border-[#c5d8f0] m-[3px]">
      {children}
    </span>
  )
}

// ---- TAB NAV ----
export function TabNav({ tabs, active, onChange }: {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex gap-0.5 bg-bg p-[3px] rounded-sm mb-[22px] border border-border w-fit">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'px-3.5 py-1.5 rounded-[5px] text-[12px] font-medium cursor-pointer border-none transition-all duration-150',
            active === t.id ? 'bg-surface text-text shadow-sm' : 'bg-transparent text-text-2'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ---- SECTION LABEL ----
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
      {children}
    </div>
  )
}

// ---- UPLOAD ZONE ----
export function UploadZone() {
  return (
    <div className="border-[1.5px] border-dashed border-border rounded p-7 text-center cursor-pointer transition-all hover:border-accent hover:bg-accent-light">
      <div className="text-2xl mb-2">⬆</div>
      <div className="text-[13px] font-medium mb-1">Glisser-déposer un fichier</div>
      <div className="text-[12px] text-text-2">PDF, JPG, PNG · Max 10 Mo</div>
    </div>
  )
}