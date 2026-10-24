import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20',
    secondary: 'bg-muted text-muted-foreground border border-transparent',
    outline: 'border border-border text-foreground',
    admin: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold',
    reader: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    // Study status badges
    revised: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    reading: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    not_started: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
