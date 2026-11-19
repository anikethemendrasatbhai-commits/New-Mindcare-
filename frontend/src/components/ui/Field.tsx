import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | null; hint?: ReactNode }

const inputClasses = (invalid: boolean) =>
  cn(
    'block h-12 w-full rounded-xl border bg-card px-3.5 text-base text-ink placeholder:text-ink-muted/70',
    'transition-colors duration-150 hover:border-primary focus:border-primary-strong disabled:bg-canvas disabled:text-ink-muted',
    invalid ? 'border-danger' : 'border-ink-muted/40',
  )

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField({ label, error, hint, className, id, 'aria-describedby': extraDescribedBy, ...rest }, ref) {
  const auto = useId()
  const fid = id ?? auto
  const describedBy = [error ? `${fid}-error` : null, hint ? `${fid}-hint` : null, extraDescribedBy].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={fid} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <input ref={ref} id={fid} className={inputClasses(!!error)} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest} />
      {hint && <p id={`${fid}-hint`} className="mt-1.5 text-sm text-ink-muted">{hint}</p>}
      {error && <p id={`${fid}-error`} className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
})

export const PasswordField = forwardRef<HTMLInputElement, FieldProps>(function PasswordField({ label, error, hint, className, id, 'aria-describedby': extraDescribedBy, ...rest }, ref) {
  const auto = useId()
  const fid = id ?? auto
  const [visible, setVisible] = useState(false)
  const describedBy = [error ? `${fid}-error` : null, hint ? `${fid}-hint` : null, extraDescribedBy].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={fid} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <div className="relative">
        <input
          ref={ref} id={fid} type={visible ? 'text' : 'password'} className={cn(inputClasses(!!error), 'pr-12')}
          aria-invalid={error ? true : undefined} aria-describedby={describedBy} autoCapitalize="none" spellCheck={false} {...rest}
        />
        <button
          type="button" onClick={() => setVisible((v) => !v)} aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ink-muted hover:text-ink"
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      </div>
      {hint && <p id={`${fid}-hint`} className="mt-1.5 text-sm text-ink-muted">{hint}</p>}
      {error && <p id={`${fid}-error`} className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
})

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode; error?: string | null }

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, error, className, id, ...rest }, ref) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          ref={ref} id={fid} type="checkbox" aria-invalid={error ? true : undefined} aria-describedby={error ? `${fid}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-md border-ink-muted/50 accent-primary-strong"
          {...rest}
        />
        <label htmlFor={fid} className="cursor-pointer text-sm leading-6 text-ink">{label}</label>
      </div>
      {error && <p id={`${fid}-error`} className="mt-1.5 pl-8 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
})
