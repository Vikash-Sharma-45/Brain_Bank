import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Search,
  Bookmark,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Folder,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { ThemeSelector } from './ThemeSelector';

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, isAdmin, logout, isLoggingOut } = useAuth();

  // Fetch subjects for sidebar tree
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await api.get('/api/subjects');
      return res.data?.subjects || [];
    },
    staleTime: 60 * 1000,
  });

  const subjects = subjectsData || [];

  const mainNav = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/saved', label: 'Saved Notes', icon: Bookmark },
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-border bg-surface text-foreground transition-all duration-300 select-none z-30 shrink-0 h-screen sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border/60">
        {!collapsed ? (
          <NavLink to="/" className="flex items-center space-x-2.5 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-foreground">BrainBank</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Personal Library
              </span>
            </div>
          </NavLink>
        ) : (
          <NavLink to="/" className="mx-auto" title="BrainBank">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
          </NavLink>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors',
            collapsed && 'hidden'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <nav className="space-y-1">
            {mainNav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all group min-h-[44px]',
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                  )
                }
                title={collapsed ? label : undefined}
              >
                <Icon className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all group min-h-[44px]',
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                  )
                }
                title={collapsed ? 'Admin Panel' : undefined}
              >
                <ShieldCheck className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3 text-amber-500')} />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>Admin Panel</span>
                    <Badge variant="admin" className="ml-1 text-[10px] py-0 px-1.5">Admin</Badge>
                  </div>
                )}
              </NavLink>
            )}
          </nav>
        </div>

        {/* Subjects Tree (expanded mode only) */}
        {!collapsed && subjects.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="px-3 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Subjects</span>
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md">{subjects.length}</span>
            </div>
            <div className="space-y-0.5">
              {subjects.map((sub) => (
                <NavLink
                  key={sub._id}
                  to={`/subjects/${sub._id}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                      isActive
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10 font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                    )
                  }
                >
                  <Folder className="h-3.5 w-3.5 mr-2.5 shrink-0 opacity-70" />
                  <span className="truncate">{sub.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / User Profile & Theme */}
      <div className="p-3 border-t border-border/60 space-y-3 bg-surface/50">
        {!collapsed ? (
          <>
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 px-1">
                Appearance
              </p>
              <ThemeSelector />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <NavLink
                to="/profile"
                className="flex items-center space-x-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-foreground truncate">
                    {user?.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user?.role === 'admin' ? 'Administrator' : 'Reader'}
                  </span>
                </div>
              </NavLink>

              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                aria-label="Log out"
                title="Log out"
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <NavLink
              to="/profile"
              title={user?.name || 'Profile'}
              className="w-8 h-8 rounded-full bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs"
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
