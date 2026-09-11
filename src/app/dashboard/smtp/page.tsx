'use client';

import React, { useState, useEffect } from 'react';
import { Server, Send } from 'lucide-react';
import { getSmtpApi, upsertSmtpApi, testSmtpApi, ApiError } from '@/lib/api';
import { SmtpConfig } from '@/types';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  LoadingSpinner,
  Modal,
} from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/useToast';

export default function SmtpConfigPage() {
  const { currentOrg } = useOrganization();
  const { addToast } = useToast();

  const [config, setConfig] = useState<SmtpConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [secure, setSecure] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Test Email Modal
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!currentOrg) return;
    getSmtpApi().then((data) => {
      if (!isMounted) return;
      setConfig(data);
      setHost(data.host);
      setPort(data.port);
      setSecure(data.secure);
      setUsername(data.username);
      setFromName(data.fromName);
      setFromEmail(data.fromEmail);
      setReplyTo(data.replyTo || '');
      setIsLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setConfig(null);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [currentOrg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim() || !username.trim() || !fromName.trim() || !fromEmail.trim()) {
      setFormError('Host, Username, From Name, and From Email are required');
      return;
    }

    if (!config && !password) {
      setFormError('Password is required for initial SMTP configuration');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const res = await upsertSmtpApi({
        host: host.trim(),
        port: Number(port),
        secure,
        username: username.trim(),
        password: password ? password : undefined,
        fromName: fromName.trim(),
        fromEmail: fromEmail.trim(),
        replyTo: replyTo.trim() || undefined,
      });

      setConfig(res);
      setPassword(''); // Clear password after submit
      addToast({
        type: 'success',
        title: 'SMTP Saved',
        message: 'SMTP settings updated successfully.',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save SMTP configuration');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim()) return;

    setIsTesting(true);

    try {
      const res = await testSmtpApi({ to: testRecipient.trim() });
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Test Email Delivered',
          message: res.message || 'SMTP connection verified successfully!',
        });
        setIsTestOpen(false);
        setTestRecipient('');
      } else {
        addToast({
          type: 'error',
          title: 'Test Email Failed',
          message: res.message || 'SMTP verification failed.',
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Test Failed', message: err.message });
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Failed to send test email.' });
      }
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading SMTP configuration..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">SMTP Configuration</h1>
            <Badge variant={config?.isConfigured ? 'success' : 'warning'} size="sm">
              {config?.isConfigured ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure custom SMTP credentials for sending transactional emails
          </p>
        </div>

        {config?.isConfigured && (
          <Button
            variant="outline"
            onClick={() => setIsTestOpen(true)}
            leftIcon={<Send className="w-4 h-4 text-emerald-400" />}
          >
            Send Test Email
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            <span>Mail Server Settings</span>
          </CardTitle>
          <CardDescription>
            Credentials are strictly stored on the server. Passwords are never returned to the UI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="SMTP Host *"
                  placeholder="smtp.mailgun.org or smtp.sendgrid.net"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Port *"
                type="number"
                placeholder="587"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="secure"
                checked={secure}
                onChange={(e) => setSecure(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-950"
              />
              <label htmlFor="secure" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Use Secure TLS/SSL Connection (Port 465)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="SMTP Username *"
                placeholder="postmaster@yourdomain.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                label={config ? 'SMTP Password (Leave blank to keep existing)' : 'SMTP Password *'}
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="border-t border-zinc-800/80 pt-6 space-y-4">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Default Sender Info
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="From Name *"
                  placeholder="Acme Notifications"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  required
                />

                <Input
                  label="From Email Address *"
                  type="email"
                  placeholder="noreply@acme.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Reply-To Email (Optional)"
                type="email"
                placeholder="support@acme.com"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <Button type="submit" isLoading={isSaving}>
                Save SMTP Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Test Email Modal */}
      <Modal
        isOpen={isTestOpen}
        onClose={() => setIsTestOpen(false)}
        title="Send Test Email"
        description="Verify your SMTP server credentials by dispatching a test email."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsTestOpen(false)} disabled={isTesting}>
              Cancel
            </Button>
            <Button onClick={handleTest} isLoading={isTesting} leftIcon={<Send className="w-4 h-4" />}>
              Send Test Email
            </Button>
          </>
        }
      >
        <form onSubmit={handleTest} className="space-y-4">
          <Input
            label="Recipient Email Address *"
            type="email"
            placeholder="you@example.com"
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            required
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
}
