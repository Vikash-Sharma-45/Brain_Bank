import React from 'react';
import { List, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function TableOfContents({
  headings = [],
  activeId,
  isOpen,
  onClose,
  onHeadingClick,
}) {
  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer (mobile) / Panel (desktop) */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 right-0 z-50 w-80 max-w-[85vw] bg-surface border-l border-border shadow-floating transition-transform duration-300 ease-in-out p-5 flex flex-col',
          'lg:static lg:z-10 lg:w-72 lg:h-[calc(100vh-8rem)] lg:sticky lg:top-20 lg:shadow-none lg:rounded-2xl lg:border lg:bg-card lg:transition-none',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
          <div className="flex items-center space-x-2">
            <List className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Table of Contents</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Close table of contents"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 pr-1 text-xs">
          {headings.map((h, i) => {
            const isActive = activeId === h.id;
            return (
              <button
                key={`${h.id}-${i}`}
                type="button"
                onClick={() => {
                  onHeadingClick(h.id);
                  if (onClose) onClose();
                }}
                className={cn(
                  'w-full text-left py-1.5 px-2 rounded-lg transition-colors truncate block leading-snug',
                  h.level === 1 && 'font-semibold',
                  h.level === 2 && 'pl-4',
                  h.level >= 3 && 'pl-6 text-muted-foreground',
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                )}
                title={h.text}
              >
                {h.text}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default TableOfContents;
