'use client';

import React, { useEffect, useRef } from 'react';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { Button } from '@/components/ui';

export interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (errorMsg: string) => void;
  text?: 'continue_with' | 'signin_with' | 'signup_with';
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  buttonText?: string;
}

export const GoogleGIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
  isLoading = false,
  className = '',
  buttonText,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isReady, isLoading: scriptLoading, isError, isDisabled, promptSignIn } = useGoogleSignIn(onSuccess);

  useEffect(() => {
    if (isError && onError) {
      onError('Google sign-in is currently unavailable.');
    }
  }, [isError, onError]);

  useEffect(() => {
    if (!isReady || !containerRef.current || !window.google?.accounts?.id || isLoading) {
      return;
    }

    containerRef.current.innerHTML = '';
    try {
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: containerRef.current.clientWidth || 360,
      });
    } catch {
      // Fallback handled gracefully
    }
  }, [isReady, text, isLoading]);

  if (isLoading) {
    return (
      <Button
        variant="secondary"
        size="lg"
        isLoading={true}
        disabled={true}
        className={`w-full ${className}`}
      >
        Signing in with Google...
      </Button>
    );
  }

  if (scriptLoading) {
    return (
      <Button
        variant="secondary"
        size="lg"
        isLoading={true}
        disabled={true}
        className={`w-full ${className}`}
      >
        Preparing Google sign-in...
      </Button>
    );
  }

  if (isDisabled || isError) {
    return (
      <Button
        variant="secondary"
        size="lg"
        disabled={true}
        leftIcon={<GoogleGIcon />}
        className={`w-full opacity-60 cursor-not-allowed ${className}`}
      >
        Google sign-in is currently unavailable
      </Button>
    );
  }

  const label =
    buttonText ||
    (text === 'signin_with'
      ? 'Sign in with Google'
      : text === 'signup_with'
      ? 'Sign up with Google'
      : 'Continue with Google');

  return (
    <div className={`w-full ${className}`}>
      {/* GIS Official Container */}
      <div
        ref={containerRef}
        className={`w-full flex justify-center items-center min-h-[44px] overflow-hidden rounded-xl ${
          isReady ? 'block' : 'hidden'
        }`}
      />

      {/* Fallback button when GIS script is not ready yet */}
      {!isReady && (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={disabled}
          onClick={promptSignIn}
          leftIcon={<GoogleGIcon />}
          className="w-full font-medium border-zinc-700/80 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-100"
        >
          {label}
        </Button>
      )}
    </div>
  );
};
