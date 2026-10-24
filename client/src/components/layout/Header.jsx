import React, { useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Search, Menu, Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';
import { Badge } from '../ui/Badge';

export function Header({ sidebarCollapsed, setSidebarCollapsed }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Global "/" or "Ctrl+K" / "Cmd+K" keyboard shortcut to jump to search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        navigate('/search');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-surface/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
      {/* Left side: Mobile Brand or Desktop Breadcrumb/Toggle */}
      <div className="flex items-center space-x-3">
        {/* Mobile Logo */}
        <div className="flex items-center space-x-2 md:hidden">
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">BrainBank</span>
          </NavLink>
        </div>

        {/* Desktop Sidebar expander button when collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Open sidebar"
            className="hidden md:flex p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Center: Search trigger on desktop */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={() => navigate('/search')}
          type="button"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground text-sm transition-colors group"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs font-medium">Search notes by title, tags, or content...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-surface border border-border rounded shadow-sm">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right side: Quick actions */}
      <div className="flex items-center space-x-2">
        {/* Mobile search button */}
        <button
          onClick={() => navigate('/search')}
          aria-label="Search notes"
          className="md:hidden min-h-tap min-w-tap w-11 h-11 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Compact Theme switcher button */}
        <ThemeSelector compact />

        {/* Mobile Profile Avatar link */}
        <NavLink
          to="/profile"
          className="md:hidden min-h-tap min-w-tap flex items-center justify-center"
        >
          <div className="w-8 h-8 rounded-full bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs ring-2 ring-transparent hover:ring-brand-500/50 transition-all">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </NavLink>

        {/* Desktop Role indicator */}
        <div className="hidden md:flex items-center space-x-2 pl-2">
          {user?.role === 'admin' ? (
            <Badge variant="admin">Admin</Badge>
          ) : (
            <Badge variant="reader">Reader</Badge>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
