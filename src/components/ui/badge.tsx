import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-violet-600 text-white',
        secondary: 'border-transparent bg-zinc-700 text-zinc-200',
        success: 'border-transparent bg-green-700 text-green-100',
        warning: 'border-transparent bg-yellow-700 text-yellow-100',
        destructive: 'border-transparent bg-red-700 text-red-100',
        outline: 'border-zinc-600 text-zinc-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
