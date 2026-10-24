import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Search, Bookmark, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/saved', label: 'Saved', icon: Bookmark },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-soft pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center min-h-tap relative transition-colors py-1',
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-1 rounded-full transition-transform',
                    isActive && 'bg-brand-500/10 scale-110'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{label}</span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-600 dark:bg-brand-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
