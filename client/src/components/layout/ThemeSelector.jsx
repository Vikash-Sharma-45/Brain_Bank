import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, BookOpen, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ThemeSelector({ className, compact = false }) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'sepia', label: 'Sepia', icon: BookOpen },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  if (compact) {
    // Cycle through themes on click for a minimal navbar button
    const nextThemeMap = {
      light: 'dark',
      dark: 'sepia',
      sepia: 'system',
      system: 'light',
    };

    const currentObj = themes.find((t) => t.id === theme) || themes[0];
    const Icon = currentObj.icon;

    return (
      <button
        onClick={() => setTheme(nextThemeMap[theme] || 'light')}
        aria-label={`Current theme: ${currentObj.label}. Click to switch theme.`}
        title={`Theme: ${currentObj.label}`}
        className={cn(
          'min-h-tap min-w-tap w-11 h-11 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors',
          className
        )}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Select color theme"
      className={cn(
        'grid grid-cols-4 gap-1 p-1 rounded-xl bg-muted/70 border border-border/50 text-xs font-medium',
        className
      )}
    >
      {themes.map(({ id, label, icon: Icon }) => {
        const isActive = theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(id)}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all min-h-[44px]',
              isActive
                ? 'bg-surface text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
            )}
          >
            <Icon className="h-4 w-4 mb-1" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeSelector;
