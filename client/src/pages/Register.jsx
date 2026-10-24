import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { BookOpen, User, Mail, Lock } from 'lucide-react';
import ThemeSelector from '../components/layout/ThemeSelector';

export function Register() {
  const { register, isRegistering } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    try {
      await register({ name, email, password });
      showToast({
        title: 'Account created!',
        description: 'Welcome to BrainBank. You are now registered.',
        variant: 'success',
      });
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setSubmitError(msg);
      showToast({
        title: 'Registration failed',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-foreground">BrainBank</span>
        </div>
        <ThemeSelector compact />
      </div>

      {/* Main Register Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <Card className="border-border shadow-soft">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-sm mt-1">
              Start reading and organizing your study materials
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
                label="Full Name"
                type="text"
                name="name"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
                }}
                error={formErrors.name}
                icon={User}
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="alex@example.com"
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
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={formErrors.password}
                icon={Lock}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword)
                    setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                error={formErrors.confirmPassword}
                icon={Lock}
                required
              />

              <Button
                type="submit"
                className="w-full text-base font-medium h-12 mt-2"
                isLoading={isRegistering}
              >
                Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-center text-sm text-muted-foreground pt-0">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="ml-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-4">
        BrainBank &bull; Private &amp; Mobile-First Reading Platform
      </footer>
    </div>
  );
}

export default Register;
