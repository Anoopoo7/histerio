'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mail, ArrowRight, Eye, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { getEmailsApi, getBillingUsage } from '@/lib/api';
import { EmailStatus, EmailSummary, UsageResponseDto } from '@/types';
import { formatDate } from '@/lib/utils/format';
import {
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';

export default function EmailsListPage() {
  const { currentOrg } = useOrganization();
  const router = useRouter();

  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [usage, setUsage] = useState<UsageResponseDto | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [recipientSearch, setRecipientSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmailStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!currentOrg) return;

    Promise.allSettled([
      getEmailsApi({
        page,
        limit,
        recipient: recipientSearch.trim() || undefined,
        status: (statusFilter as EmailStatus) || undefined,
      }),
      getBillingUsage(),
    ]).then(([emailsRes, usageRes]) => {
      if (!isMounted) return;
      if (emailsRes.status === 'fulfilled') {
        setEmails(emailsRes.value.items);
        setTotal(emailsRes.value.total);
        setTotalPages(emailsRes.value.totalPages);
      }
      if (usageRes.status === 'fulfilled') {
        setUsage(usageRes.value);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentOrg, page, limit, recipientSearch, statusFilter]);

  const renderEngagementBadge = (email: EmailSummary) => {
    const tracking = email.tracking;
    if (tracking?.bouncedAt) {
      return (
        <Badge variant="error" size="sm" dot={false}>
          <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
          <span>Bounced</span>
        </Badge>
      );
    }
    if (tracking?.opened || (tracking?.openCount ?? 0) > 0) {
      const openCount = tracking?.openCount ?? 1;
      return (
        <Badge variant="purple" size="sm" dot={false}>
          <Eye className="w-3 h-3 mr-1 shrink-0 text-purple-400" />
          <span>Opened{openCount > 1 ? ` (${openCount})` : ''}</span>
        </Badge>
      );
    }
    if (tracking?.deliveredAt) {
      return (
        <Badge variant="success" size="sm" dot={false}>
          <CheckCircle2 className="w-3 h-3 mr-1 shrink-0 text-emerald-400" />
          <span>Delivered</span>
        </Badge>
      );
    }
    if (email.status === 'SENT') {
      return (
        <Badge variant="neutral" size="sm" dot={false}>
          <Send className="w-3 h-3 mr-1 shrink-0 text-zinc-400" />
          <span>Sent</span>
        </Badge>
      );
    }
    return <span className="text-zinc-500 text-xs">—</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Transactional Email Logs</h1>
            {usage && (
              <Badge variant="info" size="sm">
                Emails this month: {usage.emailsUsed.toLocaleString()} / {usage.emailLimit.toLocaleString()}
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Audit log and engagement tracking for all dispatched transactional messages
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search by recipient email address..."
            value={recipientSearch}
            onChange={(e) => {
              setRecipientSearch(e.target.value);
              setPage(1);
              setIsLoading(true);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as EmailStatus);
            setPage(1);
            setIsLoading(true);
          }}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'QUEUED', label: 'Queued' },
            { value: 'PROCESSING', label: 'Processing' },
            { value: 'SENT', label: 'Sent' },
            { value: 'FAILED', label: 'Failed' },
          ]}
        />
      </div>

      {/* Table Container */}
      {isLoading ? (
        <LoadingSpinner label="Fetching email logs..." />
      ) : emails.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-10 h-10 text-zinc-500" />}
          title="No email logs found"
          description="Emails dispatched via the platform API will appear here with real-time tracking."
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery / Engagement</TableHead>
                <TableHead>Queued At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => (
                <TableRow
                  key={email.id}
                  onClick={() => router.push(`/dashboard/emails/${email.id}`)}
                >
                  <TableCell className="font-mono text-xs font-semibold text-zinc-200">
                    {email.to.join(', ')}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-zinc-300 max-w-xs truncate">
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
                  <TableCell>{renderEngagementBadge(email)}</TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {formatDate(email.queuedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-4 border-t border-zinc-800">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={(p) => {
                setPage(p);
                setIsLoading(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
