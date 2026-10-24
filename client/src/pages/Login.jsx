import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { BookOpen, Mail, Lock, Sparkles } from 'lucide-react';
import ThemeSelector from '../components/layout/ThemeSelector';

export function Login() {
  const { login, isLoggingIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    try {
      await login({ email, password });
      showToast({
        title: 'Welcome back!',
        description: 'Successfully signed in to BrainBank.',
        variant: 'success',
      });
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
      setSubmitError(msg);
      showToast({
        title: 'Sign in failed',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const handleUseDemoAdmin = () => {
    setEmail('admin@studynotes.com');
    setPassword('Admin@12345');
    setFormErrors({});
    setSubmitError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-background">
      {/* Top Bar with brand and theme */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-foreground">BrainBank</span>
        </div>
        <ThemeSelector compact />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <Card className="border-border shadow-soft">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
            <CardDescription className="text-sm mt-1">
              Enter your credentials to access your notes library
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {submitError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-medium"
              >
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={formErrors.email}
                icon={Mail}
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={formErrors.password}
                icon={Lock}
                required
              />

              <Button
                type="submit"
                className="w-full text-base font-medium h-12 mt-2"
                isLoading={isLoggingIn}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Fill Button */}
            <div className="mt-5 pt-4 border-t border-border/50 text-center">
              <button
                type="button"
                onClick={handleUseDemoAdmin}
                className="inline-flex items-center text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline gap-1.5 py-1 px-2.5 rounded-lg hover:bg-brand-500/10 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Fill with seeded Admin credentials
              </button>
            </div>
          </CardContent>

          <CardFooter className="justify-center text-center text-sm text-muted-foreground pt-0">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="ml-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Register here
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Footer copyright */}
      <footer className="text-center text-xs text-muted-foreground py-4">
        BrainBank &bull; Private &amp; Mobile-First Reading Platform
      </footer>
    </div>
  );
}

export default Login;
