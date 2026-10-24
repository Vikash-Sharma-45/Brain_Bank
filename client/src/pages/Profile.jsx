import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../lib/utils';
import { User, Mail, Shield, Calendar, LogOut, Moon, Sparkles, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ThemeSelector from '../components/layout/ThemeSelector';

export function Profile() {
  const { user, logout, isLoggingOut } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        variant: 'default',
      });
    } catch {
      showToast({
        title: 'Error',
        description: 'Failed to log out.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          My Profile &amp; Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account information, reading theme, and preferences
        </p>
      </div>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-600/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-2xl shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <Badge variant={user?.role === 'admin' ? 'admin' : 'reader'}>
                  {user?.role === 'admin' ? 'Administrator' : 'Reader'}
                </Badge>
              </div>
              <CardDescription className="text-sm mt-0.5">{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="truncate">
                <div className="text-muted-foreground font-medium">Email Address</div>
                <div className="font-semibold text-foreground truncate">{user?.email}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-muted-foreground font-medium">Member Since</div>
                <div className="font-semibold text-foreground">
                  {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reading Theme & Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Reading Theme
          </CardTitle>
          <CardDescription className="text-xs">
            Choose a visual style optimized for long study sessions across day and night
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      {/* Session / Logout */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="text-base text-red-600 dark:text-red-400">Account Session</CardTitle>
          <CardDescription className="text-xs">
            Signing out will clear your session cookie from this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            className="w-full sm:w-auto text-sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
