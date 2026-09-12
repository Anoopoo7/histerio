'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertOctagon,
  Eye,
  Activity,
  CheckCircle2,
  Send,
  Info,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { getEmailByIdApi } from '@/lib/api';
import { EmailDetail, EmailEventDetail } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/utils/format';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingSpinner,
  SandboxedIframe,
} from '@/components/ui';

export default function EmailDetailPage() {
  const params = useParams();
  const emailId = params.id as string;

  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEmailData = useCallback(() => {
    getEmailByIdApi(emailId)
      .then((data) => {
        setEmail(data);
        setIsLoading(false);
        setIsRefreshing(false);
      })
      .catch(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  }, [emailId]);

  // Initial fetch and lightweight 20s polling when page is active
  useEffect(() => {
    fetchEmailData();

    const interval = setInterval(() => {
      if (!document.hidden) {
        setIsRefreshing(true);
        fetchEmailData();
      }
    }, 20000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setIsRefreshing(true);
        fetchEmailData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchEmailData]);

  if (isLoading) {
    return <LoadingSpinner label="Loading email record and tracking history..." />;
  }

  if (!email) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-400">Email record not found.</p>
        <Link href="/dashboard/emails" className="mt-4 inline-block">
          <Button variant="outline">Back to Logs</Button>
        </Link>
      </div>
    );
  }

  const tracking = email.tracking;
  const openCount = tracking?.openCount ?? 0;
  const isOpened = Boolean(tracking?.opened || openCount > 0);
  const isDelivered = Boolean(tracking?.deliveredAt);
  const isBounced = Boolean(tracking?.bouncedAt);

  const getEventMeta = (evt: EmailEventDetail) => {
    const type = String(evt.event).toUpperCase();
    switch (type) {
      case 'QUEUED':
        return {
          label: 'Queued',
          description: 'Email added to delivery queue',
          icon: Clock,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
        };
      case 'PROCESSING':
        return {
          label: 'Processing',
          description: 'Email being rendered and handed to provider',
          icon: RefreshCw,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/20',
        };
      case 'SENT':
        return {
          label: 'Accepted by SMTP server',
          description: 'Provider accepted email for dispatch',
          icon: Send,
          color: 'text-zinc-300',
          bg: 'bg-zinc-800 border-zinc-700',
        };
      case 'DELIVERED':
        return {
          label: 'Delivery confirmed',
          description: 'Recipient mail server confirmed delivery',
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20',
        };
      case 'BOUNCED':
        return {
          label: 'Delivery failed',
          description: 'Delivery rejected by recipient mail server',
          icon: AlertOctagon,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/20',
        };
      case 'OPENED':
        return {
          label: 'Email opened',
          description: 'Tracking pixel requested by mail client',
          icon: Eye,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10 border-purple-500/20',
        };
      case 'FAILED':
        return {
          label: 'Sending failed',
          description: 'Error occurred during processing or dispatch',
          icon: XCircle,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/20',
        };
      default:
        return {
          label: evt.event,
          description: 'Email event recorded',
          icon: Activity,
          color: 'text-zinc-400',
          bg: 'bg-zinc-800 border-zinc-700',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/emails">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Logs
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Email Record</h1>
              <Badge
                variant={
                  email.status === 'SENT'
                    ? 'success'
                    : email.status === 'FAILED'
                    ? 'error'
                    : email.status === 'PROCESSING'
                    ? 'info'
                    : 'warning'
                }
                size="sm"
              >
                {email.status}
              </Badge>
              {isRefreshing && (
                <span className="text-[11px] text-indigo-400 font-medium animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {email.id}</p>
          </div>
        </div>
      </div>

      {/* 2. Tracking Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Delivered Card */}
        <Card className="p-4 border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Delivered</span>
            <CheckCircle2 className={`w-4 h-4 ${isDelivered ? 'text-emerald-400' : 'text-zinc-600'}`} />
          </div>
          <div className="mt-2">
            {isBounced ? (
              <span className="text-sm font-bold text-rose-400">Bounced</span>
            ) : isDelivered ? (
              <div>
                <span className="text-sm font-bold text-emerald-400">Confirmed</span>
                <span className="block text-[11px] text-zinc-400 mt-0.5 truncate">
                  {formatDate(tracking?.deliveredAt)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-zinc-500">Not yet</span>
            )}
          </div>
        </Card>

        {/* Opened Card */}
        <Card className="p-4 border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Opened</span>
            <Eye className={`w-4 h-4 ${isOpened ? 'text-purple-400' : 'text-zinc-600'}`} />
          </div>
          <div className="mt-2">
            {isOpened ? (
              <div>
                <span className="text-sm font-bold text-purple-300">Opened</span>
                <span className="block text-[11px] text-zinc-400 mt-0.5 truncate">
                  First: {formatDate(tracking?.firstOpenedAt)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-zinc-500">Not yet</span>
            )}
          </div>
        </Card>

        {/* Opens Count Card */}
        <Card className="p-4 border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Opens</span>
            <Eye className="w-4 h-4 text-purple-400/60" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-zinc-100">{openCount}</span>
            <span className="text-[11px] text-zinc-500 block">
              {openCount === 1 ? '1 open event' : `${openCount} open events`}
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Informational Explanation Callout */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-400 space-y-1.5">
        <div className="flex items-center gap-2 text-zinc-300 font-semibold">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>About Email Tracking Data</span>
        </div>
        <p className="leading-relaxed">
          • <strong className="text-zinc-300">Open tracking</strong> detects when the email&apos;s tracking pixel is requested by the recipient&apos;s mail client. Some mail clients block or proxy images, so open counts are approximate.
        </p>
        <p className="leading-relaxed">
          • <strong className="text-zinc-300">Delivered</strong> is shown only when Histeria receives a delivery confirmation from an email provider or recipient server.
        </p>
      </div>

      {/* 4. Bounced / Failed Prominent Warning Card */}
      {(isBounced || email.status === 'FAILED') && (
        <Card className="p-5 bg-rose-500/10 border-rose-500/20 text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-200">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>{isBounced ? 'Email Bounced' : 'Email Delivery Failure'}</span>
          </div>
          <p className="text-xs text-rose-300/90 leading-relaxed">
            {isBounced
              ? 'Delivery was rejected or could not be completed by the recipient mail server.'
              : 'Dispatched message failed to send to the provider.'}
          </p>
          {(tracking?.bouncedAt || email.error) && (
            <div className="mt-2 p-3 bg-black/40 rounded-lg text-xs font-mono text-rose-200">
              <span className="text-[11px] font-semibold text-rose-400 block mb-0.5">Details:</span>
              {typeof email.error === 'string'
                ? email.error
                : typeof email.error === 'object' && email.error !== null
                ? JSON.stringify(email.error, null, 2)
                : 'Mailbox delivery rejected or recipient server unavailable.'}
            </div>
          )}
        </Card>
      )}

      {/* 5. Main Content Grid: Activity Timeline & Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email Activity Timeline */}
        <Card className="md:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Email Activity Timeline
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500">{email.events.length} events logged</span>
          </div>

          <div className="space-y-6 relative pl-6 border-l border-zinc-800 mt-4">
            {email.events && email.events.length > 0 ? (
              email.events.map((evt, idx) => {
                const meta = getEventMeta(evt);
                const Icon = meta.icon;
                const reason = evt.details?.reason || evt.details?.error;

                return (
                  <div key={idx} className="relative group">
                    <span
                      className={`absolute -left-[33px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border ${meta.bg} ${meta.color} shadow-xs ring-4 ring-zinc-950`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-zinc-100">{meta.label}</span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {formatDate(evt.timestamp)} ({formatRelativeTime(evt.timestamp)})
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{meta.description}</p>

                      {/* Error or Reason for BOUNCED / FAILED */}
                      {reason && (
                        <div className="mt-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-300">
                          {String(reason)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-zinc-500 italic py-4">No events logged yet.</div>
            )}
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-3">
            Delivery Metadata
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-zinc-500 block mb-0.5">Recipient (To)</span>
              <span className="font-mono text-zinc-200 font-semibold">{email.to.join(', ')}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5">Subject</span>
              <span className="text-zinc-200 font-medium leading-snug">{email.subject}</span>
            </div>

            {email.cc && email.cc.length > 0 && (
              <div>
                <span className="text-zinc-500 block mb-0.5">CC</span>
                <span className="font-mono text-zinc-300">{email.cc.join(', ')}</span>
              </div>
            )}

            {email.bcc && email.bcc.length > 0 && (
              <div>
                <span className="text-zinc-500 block mb-0.5">BCC</span>
                <span className="font-mono text-zinc-300">{email.bcc.join(', ')}</span>
              </div>
            )}

            <div>
              <span className="text-zinc-500 block mb-0.5">Template ID</span>
              <span className="font-mono text-indigo-400 break-all">{email.templateId}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5">Template Version ID</span>
              <span className="font-mono text-zinc-300 break-all">{email.templateVersionId}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5">Attempts</span>
              <span className="font-mono text-zinc-300">{email.attempts}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5">Provider Message ID</span>
              <span className="font-mono text-zinc-400 break-all">
                {email.providerMessageId ? String(email.providerMessageId) : 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5">Queued At</span>
              <span className="text-zinc-300 font-mono">{formatDate(email.queuedAt)}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5">Sent At</span>
              <span className="text-zinc-300 font-mono">{formatDate(email.sentAt)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 6. Sandboxed HTML Email Preview Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Dispatched HTML Content Preview</span>
          </CardTitle>
          <Badge variant="success" size="sm" dot={false}>
            Sandboxed Preview (Tracking Neutralized)
          </Badge>
        </CardHeader>
        <CardContent className="p-4 bg-zinc-950">
          <SandboxedIframe html={email.html} minHeight="400px" />
        </CardContent>
      </Card>
    </div>
  );
}
