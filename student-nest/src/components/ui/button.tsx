import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 text-white shadow-xs hover:bg-neutral-800 active:scale-95',
        destructive: 'bg-red-500 text-white shadow-xs hover:bg-red-600 active:scale-95',
        outline: 'border border-neutral-300 bg-white hover:bg-neutral-100 hover:text-neutral-900 text-neutral-800',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        ghost: 'hover:bg-neutral-100 hover:text-neutral-900',
        link: 'text-[#FF385C] underline-offset-4 hover:underline font-bold',
        coral: 'bg-[#FF385C] text-white hover:bg-[#E00B41] shadow-xs active:scale-95',
        violet: 'bg-violet-600 text-white hover:bg-violet-700 shadow-xs active:scale-95',
        emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs active:scale-95',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-6 text-base font-bold',
        icon: 'h-9 w-9 rounded-xl',
        pill: 'h-9 rounded-full px-4 text-xs font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
