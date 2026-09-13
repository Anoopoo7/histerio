'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, ArrowRight, ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { ApiError, resendVerificationApi } from '@/lib/api';

import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Unverified state handling
  const [isUnverified, setIsUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  // Cooldown timer logic
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsUnverified(false);

    try {
      await login({ email: trimmedEmail, password });
      addToast({
        type: 'success',
        title: 'Logged In',
        message: 'Welcome back to Histeria!',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 403 && (err.code === 'EMAIL_NOT_VERIFIED' || err.message.toLowerCase().includes('verify'))) {
          setIsUnverified(true);
        } else if (err.statusCode === 401) {
          setError('Invalid email or password.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Invalid credentials or server unavailable');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setGoogleLoading(true);
    setError('');
    setIsUnverified(false);

    try {
      await loginWithGoogle(credential);
      addToast({
        type: 'success',
        title: 'Signed in with Google',
        message: 'Welcome back to Histeria!',
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
          setError('Google sign-in could not be completed. Please try again.');
        } else {
          setError(err.message || 'Google sign-in could not be completed. Please try again.');
        }
      } else {
        setError('Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setResending(true);
    setResendMessage('');

    try {
      const res = await resendVerificationApi({ email: trimmedEmail });
      const message = res.message || 'If an account requires verification, a verification email has been sent.';
      setResendMessage(message);
      setCooldown(60);
      addToast({
        type: 'info',
        title: 'Verification Email',
        message,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setResendMessage(err.message);
      } else {
        setResendMessage('Failed to send verification email. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-indigo-500/20 mb-2">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Welcome to Histeria</h1>
          <p className="text-xs text-zinc-400">Sign in to your transactional email dashboard</p>
        </div>

        {/* Card Form */}
        <Card className="border-zinc-800/80 shadow-2xl backdrop-blur-sm bg-zinc-900/90">
          <CardContent className="p-6 sm:p-8">
            {isUnverified ? (
              /* UNVERIFIED EMAIL CARD STATE */
              <div className="text-center space-y-5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 ring-8 ring-amber-500/5">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-100">Email not verified</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Please verify your email address (<span className="text-zinc-200 font-semibold">{email}</span>) before signing in.
                    We can send you a new verification link.
                  </p>
                </div>

                {resendMessage && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 font-medium">
                    {resendMessage}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleResendVerification}
                    isLoading={resending}
                    disabled={cooldown > 0}
                    size="lg"
                    className="w-full"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
                  </Button>

                  <button
                    onClick={() => setIsUnverified(false)}
                    className="w-full text-xs text-zinc-400 hover:text-zinc-200 font-medium py-2 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change email
                  </button>
                </div>
              </div>
            ) : (
              /* NORMAL LOGIN FORM */
              <div className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
                      {error}
                      {error.includes('Sign in with your password first') && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setError('')}
                            className="text-xs font-semibold underline text-rose-300 hover:text-rose-200"
                          >
                            Back to password login
                          </button>
                        </div>
                      )}
                    </div>
                  )}

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

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300">Password</label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4" />}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={googleLoading}
                    className="w-full mt-2"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Sign In
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900/90 px-3 text-zinc-500 font-medium tracking-wider">
                      OR
                    </span>
                  </div>
                </div>

                <GoogleSignInButton
                  text="continue_with"
                  isLoading={googleLoading}
                  disabled={isLoading}
                  onSuccess={handleGoogleSuccess}
                  onError={(msg) => setError(msg)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
