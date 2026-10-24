import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] transition-transform';

    const variants = {
      default: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
      secondary:
        'bg-muted text-foreground hover:bg-surface-hover active:bg-muted/80',
      outline:
        'border border-border bg-transparent hover:bg-surface-hover text-foreground',
      ghost:
        'hover:bg-surface-hover text-foreground hover:text-foreground',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    };

    const sizes = {
      default: 'h-11 px-4 py-2 min-h-tap text-sm',
      sm: 'h-9 px-3 text-xs rounded-lg',
      lg: 'h-12 px-6 min-h-tap text-base rounded-xl',
      icon: 'h-11 w-11 min-h-tap min-w-tap p-0 rounded-xl',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
