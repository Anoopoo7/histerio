'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertOctagon,
  Eye,
  Activity,
} from 'lucide-react';
import { getEmailByIdApi } from '@/lib/api';
import { EmailDetail } from '@/types';
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

  useEffect(() => {
    let isMounted = true;
    getEmailByIdApi(emailId).then((data) => {
      if (!isMounted) return;
      setEmail(data);
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [emailId]);

  if (isLoading) {
    return <LoadingSpinner label="Loading email record..." />;
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
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
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {email.id}</p>
          </div>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-5 space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Delivery Metadata
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 block">Recipient (To)</span>
              <span className="font-mono text-zinc-200 font-semibold">{email.to.join(', ')}</span>
            </div>

            <div>
              <span className="text-zinc-500 block">Subject</span>
              <span className="text-zinc-200 font-medium">{email.subject}</span>
            </div>

            {email.cc.length > 0 && (
              <div>
                <span className="text-zinc-500 block">CC</span>
                <span className="font-mono text-zinc-300">{email.cc.join(', ')}</span>
              </div>
            )}

            {email.bcc.length > 0 && (
              <div>
                <span className="text-zinc-500 block">BCC</span>
                <span className="font-mono text-zinc-300">{email.bcc.join(', ')}</span>
              </div>
            )}

            <div>
              <span className="text-zinc-500 block">Template ID</span>
              <span className="font-mono text-indigo-400">{email.templateId}</span>
            </div>

            <div>
              <span className="text-zinc-500 block">Template Version ID</span>
              <span className="font-mono text-zinc-300">{email.templateVersionId}</span>
            </div>

            <div>
              <span className="text-zinc-500 block">Attempts</span>
              <span className="font-mono text-zinc-300">{email.attempts}</span>
            </div>

            <div>
              <span className="text-zinc-500 block">Provider Message ID</span>
              <span className="font-mono text-zinc-400 truncate block">
                {email.providerMessageId ? String(email.providerMessageId) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Error Message callout if status is FAILED */}
          {email.error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-rose-200">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Delivery Failure Error</span>
              </div>
              <pre className="p-2 bg-black/40 rounded font-mono text-[11px] text-rose-300 overflow-x-auto whitespace-pre-wrap mt-1">
                {typeof email.error === 'string' ? email.error : JSON.stringify(email.error, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        {/* Timeline Events Column */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Event History Timeline
            </h3>
          </div>

          <div className="space-y-4 relative pl-4 border-l border-zinc-800">
            {email.events && email.events.length > 0 ? (
              email.events.map((evt, idx) => (
                <div key={idx} className="relative group">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-zinc-950" />
                  <p className="text-xs font-semibold text-zinc-200">{evt.event}</p>
                  <p className="text-[11px] text-zinc-500">
                    {new Date(evt.timestamp).toLocaleString()}
                  </p>
                  {evt.details && (
                    <pre className="mt-1 p-2 bg-zinc-950 rounded text-[10px] font-mono text-zinc-400 overflow-x-auto">
                      {JSON.stringify(evt.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 italic">No events logged yet.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Sandboxed HTML Email Preview Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Dispatched HTML Content Preview</span>
          </CardTitle>
          <Badge variant="success" size="sm" dot={false}>
            Sandboxed Preview
          </Badge>
        </CardHeader>
        <CardContent className="p-4 bg-zinc-950">
          <SandboxedIframe html={email.html} minHeight="400px" />
        </CardContent>
      </Card>
    </div>
  );
}
