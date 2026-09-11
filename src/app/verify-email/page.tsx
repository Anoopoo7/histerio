'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Zap, Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Button, Input, Card, CardContent, LoadingSpinner } from '@/components/ui';
import { verifyEmailApi, resendVerificationApi, ApiError } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const initialEmail = searchParams.get('email') || '';

  const { addToast } = useToast();

  const [verifying, setVerifying] = useState<boolean>(Boolean(token));
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>('');

  const [emailInput, setEmailInput] = useState<string>(initialEmail);
  const [resending, setResending] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>('');
  const [cooldown, setCooldown] = useState<number>(0);

  // Auto-verify token if present on mount
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    verifyEmailApi({ token })
      .then((res) => {
        if (isMounted) {
          setIsSuccess(true);
          setVerifying(false);
          addToast({
            type: 'success',
            title: 'Email Verified',
            message: res.message || 'Email verified successfully.',
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIsSuccess(false);
          setVerifying(false);
          if (err instanceof ApiError) {
            setVerifyError(err.message);
          } else {
            setVerifyError('This verification link is invalid or has expired.');
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, addToast]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async (emailToSend: string) => {
    const targetEmail = emailToSend.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      addToast({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    setResending(true);
    setResendMessage('');

    try {
      const res = await resendVerificationApi({ email: targetEmail });
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
        addToast({
          type: 'error',
          title: 'Resend Failed',
          message: err.message,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Resend Failed',
          message: 'Failed to resend verification email. Please try again.',
        });
      }
    } finally {
      setResending(false);
    }
  }, [addToast]);

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      {/* Brand */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-indigo-500/20 mb-2">
          <Zap className="w-7 h-7 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Histeria</h1>
      </div>

      <Card className="border-zinc-800/80 shadow-2xl backdrop-blur-sm bg-zinc-900/90">
        <CardContent className="p-6 sm:p-8 text-center space-y-6">
          {/* STATE 1: Token verification in progress */}
          {verifying && (
            <div className="py-8 space-y-4">
              <LoadingSpinner label="Verifying your email..." />
              <p className="text-xs text-zinc-400">Please wait while we confirm your verification link.</p>
            </div>
          )}

          {/* STATE 2: Token verification success */}
          {!verifying && token && isSuccess && (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-zinc-100">Email verified!</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your account is now verified and ready to use. Welcome to Histeria.
                </p>
              </div>
              <Link href="/login" className="block pt-2">
                <Button size="lg" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}

          {/* STATE 3: Token verification failed / expired */}
          {!verifying && token && !isSuccess && (
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 ring-8 ring-rose-500/5">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-zinc-100">Verification link expired</h2>
                <p className="text-xs text-rose-400 font-medium">
                  {verifyError || 'This verification link is invalid or has expired.'}
                </p>
              </div>

              <div className="pt-2 space-y-4 text-left border-t border-zinc-800/80">
                <p className="text-xs text-zinc-400">Request a new verification link to activate your account:</p>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                {resendMessage && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 font-medium text-center">
                    {resendMessage}
                  </div>
                )}
                <Button
                  onClick={() => handleResend(emailInput)}
                  isLoading={resending}
                  disabled={cooldown > 0 || !emailInput.trim()}
                  variant="secondary"
                  className="w-full"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
                </Button>
              </div>

              <div className="pt-2">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </Link>
              </div>
            </div>
          )}

          {/* STATE 4: No token in URL (General Check Your Email view) */}
          {!token && (
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 ring-8 ring-indigo-500/5">
                <Mail className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-100">Check your email</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We&apos;ve sent a verification link to{' '}
                  {initialEmail ? (
                    <span className="font-semibold text-zinc-200">{initialEmail}</span>
                  ) : (
                    'your email address'
                  )}
                  . Verify your email address before logging in.
                </p>
              </div>

              <div className="pt-2 space-y-4 text-left border-t border-zinc-800/80">
                {!initialEmail && (
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                )}

                {resendMessage && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 font-medium text-center">
                    {resendMessage}
                  </div>
                )}

                <p className="text-center text-xs text-zinc-400">Didn&apos;t receive the email?</p>

                <Button
                  onClick={() => handleResend(emailInput || initialEmail)}
                  isLoading={resending}
                  disabled={cooldown > 0 || !(emailInput || initialEmail).trim()}
                  variant="secondary"
                  className="w-full"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
                </Button>
              </div>

              <div className="pt-2">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <Suspense fallback={<LoadingSpinner label="Loading verification..." />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
