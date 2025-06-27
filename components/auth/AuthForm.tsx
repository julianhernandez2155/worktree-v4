'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Mail, Lock, User, ArrowRight, Github } from 'lucide-react';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  mode?: AuthMode;
  redirectTo?: string;
}

export function AuthForm({ mode: initialMode = 'login', redirectTo = '/' }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const supabase = createClient();

  const validateEmail = (email: string) => {
    setEmailError(null);
    // Check if it's a .edu email for signup
    if (mode === 'signup' && !email.endsWith('.edu')) {
      setEmailError('Please use your university email (.edu)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
          },
        });

        if (signUpError) throw signUpError;
        setSuccess(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        // Check if user has profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        
        if (!profile) {
          window.location.href = '/onboarding';
        } else {
          window.location.href = redirectTo;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <GlassCard className="max-w-md w-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-neon-green" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-gray-400">
            We sent you a confirmation link. Please check your email to complete signup.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="max-w-md w-full p-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        {mode === 'login' ? 'Welcome back' : 'Create account'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'signup' && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="input-field pl-10"
                required={mode === 'signup'}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email {mode === 'signup' && <span className="text-gray-400">(use your .edu email)</span>}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={(e) => validateEmail(e.target.value)}
              placeholder={mode === 'signup' ? 'you@university.edu' : 'you@example.com'}
              className="input-field pl-10"
              required
            />
          </div>
          {emailError && (
            <p className="text-red-400 text-sm mt-1">{emailError}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pl-10"
              required
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        <NeonButton
          type="submit"
          fullWidth
          loading={loading}
          icon={<ArrowRight />}
          iconPosition="right"
        >
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </NeonButton>
      </form>

      {/* OAuth Options */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-dark-card text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <NeonButton
            variant="secondary"
            fullWidth
            onClick={() => {
              // TODO: Implement Google OAuth
              setError('Google login coming soon!');
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </NeonButton>

          <NeonButton
            variant="secondary"
            fullWidth
            icon={<Github />}
            onClick={() => {
              // TODO: Implement GitHub OAuth
              setError('GitHub login coming soon!');
            }}
          />

          <NeonButton
            variant="secondary"
            fullWidth
            onClick={() => {
              // TODO: Implement LinkedIn OAuth
              setError('LinkedIn login coming soon!');
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </NeonButton>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
        </p>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError(null);
          }}
          className="text-neon-green hover:text-neon-green/80 font-medium mt-1"
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </GlassCard>
  );
}