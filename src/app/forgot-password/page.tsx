'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { forgotPasswordApi, ApiError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await forgotPasswordApi({ email: trimmedEmail });
      const message =
        res.message || 'If an account exists for this email, a password reset link has been sent.';
      setResponseMessage(message);
      setIsSubmitted(true);
      addToast({
        type: 'info',
        title: 'Password Reset',
        message,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        // Show generic backend message to prevent email enumeration
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

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
            {isSubmitted ? (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 ring-8 ring-indigo-500/5">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-zinc-100">Check your email</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {responseMessage ||
                      "If an account exists for this email, we've sent a password reset link."}
                  </p>
                  <p className="text-[11px] text-zinc-500">The link will expire after a limited time.</p>
                </div>
                <div className="pt-2">
                  <Link href="/login" className="block">
                    <Button size="lg" variant="secondary" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center space-y-1 mb-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 mb-1">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100">Forgot your password?</h2>
                  <p className="text-xs text-zinc-400">
                    Enter your account email and we&apos;ll send you a password reset link.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
                    {error}
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

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full mt-2"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send reset link
                </Button>

                <div className="pt-2 text-center">
                  <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
