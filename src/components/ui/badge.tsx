import { cn } from '@/utilities/ui'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-heading font-semibold tracking-wide whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        accent: 'bg-accent text-accent-foreground',
        outline: 'border border-primary text-primary',
        muted: 'bg-muted text-muted-foreground',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-[0.65rem]',
        md: 'px-3 py-1 text-xs',
      },
    },
    defaultVariants: { variant: 'accent', size: 'md' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge: React.FC<BadgeProps> = ({ className, variant, size, ...props }) => {
  return <span className={cn('vf-badge', badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
