'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { ApiError } from '@/lib/api';

import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function RegisterPage() {
  const { register, loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Full name is required');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      addToast({
        type: 'success',
        title: 'Account Created',
        message: res.message || 'Registration successful. Verification email queued.',
      });

      router.push(`/verify-email?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 409) {
          setError('An account with this email already exists.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setGoogleLoading(true);
    setError('');

    try {
      await loginWithGoogle(credential);
      addToast({
        type: 'success',
        title: 'Account Created',
        message: 'Signed in with Google successfully!',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 409 || err.code === 'GOOGLE_ACCOUNT_EXISTS') {
          setError(
            'An account already exists with this email. Sign in with your password first, then connect Google from Account Settings.',
          );
        } else if (err.statusCode === 429) {
          setError('Too many sign-in attempts. Please try again later.');
        } else if (err.statusCode === 400) {
          setError('Google registration could not be completed. Please try again.');
        } else {
          setError(err.message || 'Google registration could not be completed. Please try again.');
        }
      } else {
        setError('Google registration could not be completed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-indigo-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/25 mb-1 hover:scale-105 transition-transform duration-300">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Create your account</h1>
          <p className="text-xs text-zinc-400 font-medium">Start sending transactional emails in minutes</p>
        </div>

        {/* Premium Outer Card Wrapper with Subtle Gradient Border */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-b from-zinc-700/60 via-zinc-800/40 to-zinc-900/60 shadow-2xl shadow-black/80">
          <Card className="border-0 shadow-none bg-zinc-950/90 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
                    {error}
                  </div>
                )}

                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                  autoComplete="name"
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                  autoComplete="new-password"
                  helperText="Must be at least 8 characters"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={googleLoading}
                  className="w-full mt-2"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Account
                </Button>
              </form>

              {/* Refined Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-zinc-950/90 border border-zinc-800/80 px-3 py-1 rounded-full text-zinc-500 shadow-inner">
                    OR
                  </span>
                </div>
              </div>

              {/* Hyper-Premium Google Sign-In Button */}
              <GoogleSignInButton
                text="signup_with"
                isLoading={googleLoading}
                disabled={isLoading}
                onSuccess={handleGoogleSuccess}
                onError={(msg) => setError(msg)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
