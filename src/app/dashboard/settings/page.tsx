'use client';

import React, { useState } from 'react';
import { Shield, Key, User as UserIcon, CheckCircle2, AlertTriangle, AlertCircle, Trash2, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, Button, Modal, Badge } from '@/components/ui';
import { GoogleSignInButton, GoogleGIcon } from '@/components/GoogleSignInButton';
import { ApiError } from '@/lib/api';


export default function AccountSettingsPage() {
  const { user, linkGoogle, unlinkGoogle } = useAuth();
  const { addToast } = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

  const authProviders = user?.authProviders || ['password'];
  const isGoogleConnected = authProviders.includes('google');
  const isPasswordConnected = authProviders.includes('password');
  const canDisconnectGoogle = isGoogleConnected && authProviders.length > 1;

  const handleConnectGoogleSuccess = async (credential: string) => {
    setIsConnecting(true);
    try {
      await linkGoogle(credential);
      addToast({
        type: 'success',
        title: 'Google Account Connected',
        message: 'Google account connected successfully.',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 409) {
          addToast({
            type: 'error',
            title: 'Connection Failed',
            message: 'This Google account is already connected to another Histeria account.',
          });
        } else {
          addToast({
            type: 'error',
            title: 'Connection Failed',
            message: err.message || 'Could not connect Google account.',
          });
        }
      } else {
        addToast({
          type: 'error',
          title: 'Connection Failed',
          message: 'Could not connect Google account. Please try again.',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setIsDisconnecting(true);
    try {
      await unlinkGoogle();
      addToast({
        type: 'info',
        title: 'Google Disconnected',
        message: 'Google account disconnected.',
      });
      setIsDisconnectModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Disconnection Failed',
          message: err.message || 'Could not disconnect Google account.',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Disconnection Failed',
          message: 'Could not disconnect Google account. Please try again.',
        });
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Account Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your profile and authentication methods
        </p>
      </div>

      {/* Profile Overview */}
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-base">
            <UserIcon className="w-5 h-5 text-indigo-400" />
            Profile Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
              <span className="text-zinc-500 font-medium block">Full Name</span>
              <span className="text-zinc-200 font-semibold text-sm">{user?.name || 'N/A'}</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
              <span className="text-zinc-500 font-medium block">Email Address</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-200 font-semibold text-sm">{user?.email || 'N/A'}</span>
                {user?.emailVerified ? (
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication / Connected Accounts */}
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-base">
              <Shield className="w-5 h-5 text-indigo-400" />
              Authentication Methods
            </div>
            <p className="text-xs text-zinc-400">
              Manage sign-in options connected to your Histeria account
            </p>
          </div>

          <div className="space-y-4">
            {/* Password Item */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Password</h4>
                  <p className="text-xs text-zinc-500">Sign in with email and password</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPasswordConnected ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500 font-medium">Not configured</span>
                )}
              </div>
            </div>

            {/* Google Item */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <GoogleGIcon />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Google</h4>
                  <p className="text-xs text-zinc-500">Sign in with Google OAuth single sign-on</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isGoogleConnected ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>

                    {canDisconnectGoogle ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setIsDisconnectModalOpen(true)}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <span
                        title="Google is your only authentication method. Add password login before disconnecting Google."
                        className="text-[11px] text-zinc-500 font-medium italic flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Only login method
                      </span>
                    )}
                  </>
                ) : (
                  <div className="min-w-[200px]">
                    <GoogleSignInButton
                      text="signin_with"
                      isLoading={isConnecting}
                      onSuccess={handleConnectGoogleSuccess}
                      buttonText="Connect Google"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal & Privacy Section */}
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-base">
              <FileText className="w-5 h-5 text-indigo-400" />
              Legal & Privacy Policies
            </div>
            <p className="text-xs text-zinc-400">
              Review published agreements, data processing rules, and legal compliance documents
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <a
              href="/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-zinc-200 block group-hover:text-indigo-300">
                  Terms of Service
                </span>
                <span className="text-[11px] text-zinc-500">v2026-01 • Mandatory</span>
              </div>
              <Badge variant="success" size="sm">
                Accepted
              </Badge>
            </a>

            <a
              href="/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-zinc-200 block group-hover:text-indigo-300">
                  Privacy Policy
                </span>
                <span className="text-[11px] text-zinc-500">v2026-01 • Acknowledged</span>
              </div>
              <Badge variant="success" size="sm">
                Acknowledged
              </Badge>
            </a>

            <a
              href="/legal/acceptable-use"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-zinc-200 block group-hover:text-indigo-300">
                  Acceptable Use Policy
                </span>
                <span className="text-[11px] text-zinc-500">v2026-01 • Active</span>
              </div>
              <Badge variant="info" size="sm">
                Published
              </Badge>
            </a>

            <a
              href="/legal/anti-spam"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-zinc-200 block group-hover:text-indigo-300">
                  Anti-Spam Policy
                </span>
                <span className="text-[11px] text-zinc-500">v2026-01 • Active</span>
              </div>
              <Badge variant="info" size="sm">
                Published
              </Badge>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Google Confirmation Modal */}
      <Modal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        title="Disconnect Google Account"
        description="Are you sure you want to disconnect Google from your Histeria account?"
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={isDisconnecting}
              onClick={() => setIsDisconnectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={isDisconnecting}
              onClick={handleDisconnectGoogle}
            >
              Disconnect Google
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            Disconnecting Google will prevent you from signing in using Google. You will still be able to log in using your email and password.
          </p>
        </div>
      </Modal>
    </div>
  );
}
