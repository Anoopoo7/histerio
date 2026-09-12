'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  Clock,
  AlertTriangle,
  FileCode,
  Key,
  Server,
  Plus,
  ArrowRight,
  Activity,
  ShieldAlert,
  CreditCard,
} from 'lucide-react';
import {
  getEmailsApi,
  getTemplatesApi,
  getApiKeysApi,
  getHealthApi,
  getSmtpApi,
  getBillingSubscription,
  getBillingUsage,
} from '@/lib/api';
import { EmailSummary, HealthStatus, SubscriptionResponseDto, UsageResponseDto } from '@/types';
import {
  Card,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardOverviewPage() {
  const { currentOrg } = useOrganization();
  const { user } = useAuth();
  const router = useRouter();

  const [sentCount, setSentCount] = useState<number | null>(null);
  const [queuedCount, setQueuedCount] = useState<number | null>(null);
  const [failedCount, setFailedCount] = useState<number | null>(null);
  const [templatesCount, setTemplatesCount] = useState<number | null>(null);
  const [apiKeysCount, setApiKeysCount] = useState<number | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);

  const [recentEmails, setRecentEmails] = useState<EmailSummary[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponseDto | null>(null);
  const [usage, setUsage] = useState<UsageResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (!currentOrg) return;

    Promise.allSettled([
      getEmailsApi({ limit: 100, page: 1 }),
      getTemplatesApi({ limit: 1 }),
      getApiKeysApi(),
      getHealthApi(),
      getSmtpApi(),
      getBillingSubscription(),
      getBillingUsage(),
    ]).then(([emailsRes, templatesRes, apiKeysRes, healthRes, smtpRes, subRes, usageRes]) => {
      if (!isMounted) return;

      let calculatedSent = 0;
      let calculatedQueued = 0;
      let calculatedFailed = 0;

      if (emailsRes.status === 'fulfilled') {
        const items = emailsRes.value.items;
        setRecentEmails(items.slice(0, 5));

        calculatedSent = items.filter((e) =>
          ['SENT', 'DELIVERED', 'OPENED', 'CLICKED'].includes(e.status)
        ).length;

        calculatedQueued = items.filter((e) =>
          ['QUEUED', 'PROCESSING'].includes(e.status)
        ).length;

        calculatedFailed = items.filter((e) =>
          ['FAILED', 'BOUNCED'].includes(e.status)
        ).length;
      }

      if (usageRes.status === 'fulfilled') {
        setUsage(usageRes.value);
        const billingSent = usageRes.value.emailsUsed ?? 0;
        setSentCount(Math.max(billingSent, calculatedSent));
      } else {
        setSentCount(calculatedSent);
      }

      setQueuedCount(calculatedQueued);
      setFailedCount(calculatedFailed);

      if (templatesRes.status === 'fulfilled') {
        setTemplatesCount(templatesRes.value.total);
      }
      if (apiKeysRes.status === 'fulfilled') {
        setApiKeysCount(apiKeysRes.value.length);
      }
      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      }
      if (smtpRes.status === 'fulfilled') {
        setSmtpConfigured(smtpRes.value.isConfigured);
      } else {
        setSmtpConfigured(false);
      }
      if (subRes.status === 'fulfilled') {
        setSubscription(subRes.value);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentOrg]);

  if (isLoading) {
    return <LoadingSpinner label="Loading dashboard metrics..." />;
  }

  const statCards = [
    {
      title: 'Emails Sent',
      value: sentCount !== null ? sentCount.toLocaleString() : 'N/A',
      icon: Send,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Queued',
      value: queuedCount !== null ? queuedCount.toLocaleString() : 'N/A',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Failed',
      value: failedCount !== null ? failedCount.toLocaleString() : 'N/A',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Templates',
      value: templatesCount !== null ? templatesCount.toLocaleString() : 'N/A',
      icon: FileCode,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'API Keys',
      value: apiKeysCount !== null ? apiKeysCount.toLocaleString() : 'N/A',
      icon: Key,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time status and metrics for <span className="font-semibold text-zinc-200">{currentOrg?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/templates/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>New Template</Button>
          </Link>
        </div>
      </div>

      {/* Unverified Email Notice if user email is unverified */}
      {user && user.emailVerified === false && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Your email address ({user.email}) is not verified. Please verify your email address.</span>
          </div>
          <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`}>
            <Button variant="secondary" size="sm" className="whitespace-nowrap">
              Verify Email
            </Button>
          </Link>
        </div>
      )}

      {/* SMTP Configuration Notice if not set up */}
      {smtpConfigured === false && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-amber-400 shrink-0" />
            <span>SMTP is not configured for this organization. Configure SMTP to send real emails.</span>
          </div>
          <Link href="/dashboard/smtp">
            <Button variant="secondary" size="sm" className="whitespace-nowrap">
              Configure SMTP
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-5 border-zinc-800/80 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{stat.title}</span>
                <div className={`p-2 rounded-lg border ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-zinc-100 tracking-tight">{stat.value}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Billing & Quotas Summary Widget */}
      {usage && (
        <Card className="p-5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-100">
                    {subscription?.plan?.name || subscription?.planCode || 'FREE'} Plan
                  </h3>
                  <Badge variant={subscription?.status === 'ACTIVE' ? 'success' : 'purple'} size="sm">
                    {subscription?.status || 'ACTIVE'}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">Current billing period quotas and consumption</p>
              </div>
            </div>
            <Link href="/dashboard/billing">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Manage Subscription
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 space-y-1.5">
              <span className="text-zinc-400 block font-medium">Emails Consumption</span>
              <span className="font-mono text-zinc-100 font-bold text-sm">
                {usage.emailsUsed.toLocaleString()} / {usage.emailLimit.toLocaleString()}
              </span>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${Math.min(100, usage.usagePercent)}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 space-y-1.5">
              <span className="text-zinc-400 block font-medium">Templates Used</span>
              <span className="font-mono text-zinc-100 font-bold text-sm">
                {usage.templateCount.toLocaleString()} / {usage.templateLimit.toLocaleString()}
              </span>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((usage.templateCount / Math.max(1, usage.templateLimit)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 space-y-1.5">
              <span className="text-zinc-400 block font-medium">Team Members</span>
              <span className="font-mono text-zinc-100 font-bold text-sm">
                {usage.memberCount.toLocaleString()} / {usage.memberLimit.toLocaleString()}
              </span>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((usage.memberCount / Math.max(1, usage.memberLimit)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* System Health Status & Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">System Health</h3>
            <Activity className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800/60">
              <span className="text-zinc-300">Backend API</span>
              <Badge variant={health?.status === 'ok' ? 'success' : 'error'} size="sm">
                {health?.status === 'ok' ? 'Online' : 'Degraded'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800/60">
              <span className="text-zinc-300">MongoDB Database</span>
              <Badge variant={health?.mongodb === 'connected' ? 'success' : 'error'} size="sm">
                {health?.mongodb === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-500 pt-1">
              Last checked: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
        </Card>

        {/* Quick Actions Card */}
        <Card className="p-5 md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Quick Setup Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/dashboard/templates/new" className="group">
                <div className="p-3 bg-zinc-950/60 hover:bg-zinc-800/50 border border-zinc-800 rounded-xl transition-colors">
                  <FileCode className="w-4 h-4 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-zinc-200">Create Template</p>
                  <p className="text-[11px] text-zinc-500">Design email templates</p>
                </div>
              </Link>
              <Link href="/dashboard/api-keys" className="group">
                <div className="p-3 bg-zinc-950/60 hover:bg-zinc-800/50 border border-zinc-800 rounded-xl transition-colors">
                  <Key className="w-4 h-4 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-zinc-200">Generate API Key</p>
                  <p className="text-[11px] text-zinc-500">Authenticate API calls</p>
                </div>
              </Link>
              <Link href="/dashboard/smtp" className="group">
                <div className="p-3 bg-zinc-950/60 hover:bg-zinc-800/50 border border-zinc-800 rounded-xl transition-colors">
                  <Server className="w-4 h-4 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-zinc-200">Configure SMTP</p>
                  <p className="text-[11px] text-zinc-500">Connect mail provider</p>
                </div>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Emails Table */}
      <Card>
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Recent Emails</h3>
            <p className="text-xs text-zinc-400">Latest transactional emails processed</p>
          </div>
          <Link href="/dashboard/emails">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Logs
            </Button>
          </Link>
        </div>

        {recentEmails.length === 0 ? (
          <EmptyState
            title="No emails sent yet"
            description="Trigger emails using the public API or test your templates."
            actionLabel="View Templates"
            onAction={() => router.push('/dashboard/templates')}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Queued At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEmails.map((email) => (
                <TableRow
                  key={email.id}
                  onClick={() => router.push(`/dashboard/emails/${email.id}`)}
                >
                  <TableCell className="font-mono text-xs text-zinc-300">
                    {email.to.join(', ')}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-200 truncate max-w-xs">
                    {email.subject}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {new Date(email.queuedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
