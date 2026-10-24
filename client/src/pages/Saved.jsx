import React, { useState } from 'react';
import { Bookmark, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

export function Saved() {
  const [tab, setTab] = useState('bookmarks'); // 'bookmarks' | 'revised'

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          Saved & Revision
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Access your bookmarked study notes and revision queue
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab('bookmarks')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors min-h-tap',
            tab === 'bookmarks'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Bookmark className="h-4 w-4" />
          <span>Bookmarked</span>
        </button>
        <button
          onClick={() => setTab('revised')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors min-h-tap',
            tab === 'revised'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Marked as Revised</span>
        </button>
      </div>

      {/* Empty State / Placeholder */}
      <Card className="p-12 text-center border-dashed">
        <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-3">
          {tab === 'bookmarks' ? <Bookmark className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {tab === 'bookmarks' ? 'No bookmarked notes yet' : 'No revised notes yet'}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          You can bookmark any note or mark it as revised while studying. Interactive bookmarks and revision tracking will be linked in Phase 5.
        </p>
      </Card>
    </div>
  );
}

export default Saved;
