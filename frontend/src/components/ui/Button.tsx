import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  // primary-strong (derived) keeps white labels at 6.1:1; the exact brand teal is used for surfaces and accents.
  primary: 'bg-primary-strong text-white hover:bg-primary-stronger shadow-sm',
  secondary: 'bg-secondary text-primary-strong hover:bg-secondary-strong',
  ghost: 'bg-transparent text-ink hover:bg-secondary',
  danger: 'bg-danger text-white hover:brightness-95',
}
const sizes: Record<Size, string> = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-4 text-[0.9375rem]', lg: 'h-12 px-6 text-base' }

export const buttonClasses = (variant: Variant = 'primary', size: Size = 'md', extra?: string) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60',
    variants[variant], sizes[size], extra,
  )

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, loadingText, icon, children, className, disabled, type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Spinner /> : icon}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  )
}
