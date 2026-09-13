'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type ScriptStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'disabled';

let globalScriptStatus: ScriptStatus = 'idle';
let globalScriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window unavailable'));
  }
  if (window.google?.accounts?.id) {
    globalScriptStatus = 'loaded';
    return Promise.resolve();
  }
  if (globalScriptPromise) {
    return globalScriptPromise;
  }

  globalScriptStatus = 'loading';
  globalScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      globalScriptStatus = 'loaded';
      resolve();
    };
    script.onerror = (err) => {
      globalScriptStatus = 'error';
      globalScriptPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return globalScriptPromise;
}

export function useGoogleSignIn(onCredentialReceived?: (credential: string) => void) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const [status, setStatus] = useState<ScriptStatus>(() => {
    if (!clientId) return 'disabled';
    return globalScriptStatus;
  });

  const callbackRef = useRef(onCredentialReceived);
  useEffect(() => {
    callbackRef.current = onCredentialReceived;
  }, [onCredentialReceived]);

  const initRef = useRef(false);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let isMounted = true;

    loadGisScript()
      .then(() => {
        if (!isMounted) return;
        setStatus('loaded');

        if (window.google?.accounts?.id && callbackRef.current) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (res) => {
              if (res.credential && callbackRef.current) {
                callbackRef.current(res.credential);
              }
            },
          });
          initRef.current = true;
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  const promptSignIn = useCallback(() => {
    if (window.google?.accounts?.id && clientId) {
      if (!initRef.current && callbackRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => {
            if (res.credential && callbackRef.current) {
              callbackRef.current(res.credential);
            }
          },
        });
        initRef.current = true;
      }
      window.google.accounts.id.prompt();
    }
  }, [clientId]);

  return {
    isReady: status === 'loaded',
    isLoading: status === 'loading',
    isError: status === 'error',
    isDisabled: status === 'disabled' || !clientId,
    status,
    clientId,
    promptSignIn,
  };
}
