import React from 'react';
import { cn } from '../../lib/utils';

export function Spinner({ className, size = 'default' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    default: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-brand-500 border-t-transparent',
        sizes[size] || sizes.default,
        className
      )}
    />
  );
}

export function LoadingScreen({ message = 'Loading BrainBank...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/10 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
          <Spinner size="default" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}

export default Spinner;
