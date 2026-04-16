import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:
          'bg-ds-accent text-white rounded-xl hover:bg-ds-accentHover active:bg-ds-accentGlow shadow-accent-glow text-sm',
        secondary:
          'bg-ds-hover text-ds-text2 rounded-xl hover:bg-[#263244] hover:text-ds-text border border-ds-border text-sm',
        ghost:
          'text-ds-muted rounded-xl hover:bg-ds-hover hover:text-ds-text2 text-sm',
        destructive:
          'bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 border border-red-500/20 text-sm',
        outline:
          'border border-ds-border bg-transparent text-ds-text2 rounded-xl hover:bg-ds-hover hover:text-ds-text text-sm',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-5 py-3',
        icon: 'p-1.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
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
