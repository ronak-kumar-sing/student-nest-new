import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-neutral-900 text-white shadow-2xs',
        secondary: 'border-transparent bg-neutral-100 text-neutral-900',
        destructive: 'border-transparent bg-red-100 text-red-700 border border-red-200',
        outline: 'text-neutral-700 border border-neutral-200 bg-white',
        coral: 'bg-[#FF385C]/10 text-[#FF385C] border border-[#FF385C]/20',
        violet: 'bg-violet-100 text-violet-800 border border-violet-200',
        emerald: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        amber: 'bg-amber-100 text-amber-800 border border-amber-200',
        blue: 'bg-blue-100 text-blue-800 border border-blue-200',
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
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
