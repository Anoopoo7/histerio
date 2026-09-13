'use client';

import React, { useEffect, useRef } from 'react';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { Loader2 } from 'lucide-react';

export interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (errorMsg: string) => void;
  text?: 'continue_with' | 'signin_with' | 'signup_with';
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  buttonText?: string;
}

export const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={`${className} shrink-0`}>
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
        width: 400,
      });
    } catch {
      // Fallback handled gracefully
    }
  }, [isReady, text, isLoading]);

  const label =
    buttonText ||
    (text === 'signin_with'
      ? 'Sign in with Google'
      : text === 'signup_with'
        ? 'Sign up with Google'
        : 'Continue with Google');

  if (isLoading) {
    return (
      <div className={`w-full p-[1px] rounded-xl bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40 ${className}`}>
        <div className="w-full h-11 px-4 flex items-center justify-center gap-3 bg-zinc-950 rounded-xl border border-white/5 text-zinc-300 font-medium text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Signing in with Google...</span>
        </div>
      </div>
    );
  }

  if (scriptLoading) {
    return (
      <div className={`w-full p-[1px] rounded-xl bg-zinc-800 ${className}`}>
        <div className="w-full h-11 px-4 flex items-center justify-center gap-3 bg-zinc-950 rounded-xl border border-white/5 text-zinc-400 font-medium text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
          <span>Preparing Google sign-in...</span>
        </div>
      </div>
    );
  }

  if (isDisabled || isError) {
    return (
      <div className={`w-full p-[1px] rounded-xl bg-zinc-850 opacity-60 cursor-not-allowed ${className}`}>
        <div className="w-full h-11 px-4 flex items-center justify-center gap-3 bg-zinc-950 rounded-xl border border-white/5 text-zinc-500 font-medium text-sm">
          <GoogleGIcon className="w-4 h-4 grayscale opacity-50" />
          <span>Google sign-in is currently unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full group select-none cursor-pointer ${className}`}>
      {/* Outer Gradient Glow Border Container */}
      <div className="p-[1px] rounded-xl bg-gradient-to-b from-zinc-700/80 via-zinc-800/60 to-zinc-900/80 group-hover:from-indigo-500/60 group-hover:via-purple-500/40 group-hover:to-pink-500/60 transition-all duration-300 shadow-lg shadow-black/50 group-hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.35)]">
        {/* Inner Glassmorphic Button Body */}
        <div
          className={`relative w-full h-11 px-4 flex items-center justify-center gap-3 bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 group-hover:from-zinc-850 group-hover:to-zinc-900 rounded-xl border-t border-white/10 group-hover:border-white/20 transition-all duration-200 ${disabled ? 'opacity-50 pointer-events-none' : ''
            }`}
        >
          {/* Subtle Accent Glow Ring */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Crisp Badge Container for Google G Icon */}
          <div className="w-7 h-7 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:border-zinc-700 transition-all duration-200 shrink-0">
            <GoogleGIcon className="w-4.5 h-4.5" />
          </div>

          {/* Button Label */}
          <span className="text-sm font-semibold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
            {label}
          </span>
        </div>
      </div>

      {/* Invisible Interactive GIS Button Overlay */}
      {isReady && (
        <div
          ref={containerRef}
          onClick={promptSignIn}
          className="absolute inset-0 w-full h-full opacity-[0.0001] z-10 cursor-pointer overflow-hidden flex items-center justify-center scale-125"
        />
      )}
    </div>
  );
};
