'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Zap, Lock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Button, Input, Card, CardContent, LoadingSpinner } from '@/components/ui';
import { resetPasswordApi, ApiError } from '@/lib/api';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isInvalidToken, setIsInvalidToken] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 ring-8 ring-rose-500/5">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-100">Missing reset token</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No password reset token was provided in the link. Please request a new password reset link.
          </p>
        </div>
        <Link href="/forgot-password" className="block pt-2">
          <Button size="lg" className="w-full">
            Request a new reset link
          </Button>
        </Link>
      </div>
    );
  }

  if (isInvalidToken) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 ring-8 ring-rose-500/5">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-100">Invalid or expired link</h2>
          <p className="text-xs text-rose-400 font-medium">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Link href="/forgot-password" className="block pt-2">
          <Button size="lg" className="w-full">
            Request a new reset link
          </Button>
        </Link>
        <div className="pt-2">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-100">Password reset successfully</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <Link href="/login" className="block pt-2">
          <Button size="lg" className="w-full">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('New password is required');
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
      const res = await resetPasswordApi({ token, password });
      setIsSuccess(true);
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: res.message || 'Password reset successfully.',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 400 || err.statusCode === 404) {
          setIsInvalidToken(true);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-lg font-bold text-zinc-100">Reset password</h2>
        <p className="text-xs text-zinc-400">Enter a new secure password for your Histeria account.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
          {error}
        </div>
      )}

      <Input
        label="New Password"
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
        label="Confirm New Password"
        type="password"
        placeholder="Repeat your new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        leftIcon={<Lock className="w-4 h-4" />}
        required
        autoComplete="new-password"
      />

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-2"
        size="lg"
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Reset password
      </Button>

      <div className="pt-2 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Histeria</h1>
        </div>

        {/* Card Form */}
        <Card className="border-zinc-800/80 shadow-2xl backdrop-blur-sm bg-zinc-900/90">
          <CardContent className="p-6 sm:p-8">
            <Suspense fallback={<LoadingSpinner label="Loading..." />}>
              <ResetPasswordContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
