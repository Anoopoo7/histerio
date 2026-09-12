'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FileCode,
  CheckCircle,
  Archive,
  Edit,
  History,
  AlertTriangle,
  Terminal,
} from 'lucide-react';
import { getTemplatesApi, activateTemplateApi, archiveTemplateApi, getBillingUsage, ApiError } from '@/lib/api';
import { EditorType, Template, TemplateStatus, UsageResponseDto } from '@/types';
import {
  Button,
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
  Modal,
} from '@/components/ui';
import { SendApiCodeModal } from '@/components/SendApiCodeModal';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/useToast';

export default function TemplatesListPage() {
  const { currentOrg } = useOrganization();
  const { addToast } = useToast();
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [usage, setUsage] = useState<UsageResponseDto | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | ''>('');
  const [editorTypeFilter, setEditorTypeFilter] = useState<EditorType | ''>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals for actions
  const [activateTarget, setActivateTarget] = useState<Template | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Template | null>(null);
  const [codeModalTarget, setCodeModalTarget] = useState<Template | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    if (!currentOrg) return;
    try {
      const [res, usageRes] = await Promise.allSettled([
        getTemplatesApi({
          page,
          limit,
          search: search.trim() || undefined,
          status: (statusFilter as TemplateStatus) || undefined,
          editorType: (editorTypeFilter as EditorType) || undefined,
        }),
        getBillingUsage(),
      ]);

      if (res.status === 'fulfilled') {
        setTemplates(res.value.items);
        setTotal(res.value.total);
        setTotalPages(res.value.totalPages);
      }
      if (usageRes.status === 'fulfilled') {
        setUsage(usageRes.value);
      }
    } catch {
      // Failed to load templates
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg, page, limit, search, statusFilter, editorTypeFilter]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!currentOrg || ignore) return;
      await loadTemplates();
    };
    run();
    return () => {
      ignore = true;
    };
  }, [currentOrg, loadTemplates]);

  const handleActivate = async () => {
    if (!activateTarget) return;
    setActionLoading(true);
    try {
      await activateTemplateApi(activateTarget.id);
      addToast({
        type: 'success',
        title: 'Template Activated',
        message: `"${activateTarget.name}" is now active.`,
      });
      setActivateTarget(null);
      loadTemplates();
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Activation Failed', message: err.message });
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Failed to activate template' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setActionLoading(true);
    try {
      await archiveTemplateApi(archiveTarget.id);
      addToast({
        type: 'success',
        title: 'Template Archived',
        message: `"${archiveTarget.name}" has been archived.`,
      });
      setArchiveTarget(null);
      loadTemplates();
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Archive Failed', message: err.message });
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Failed to archive template' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Email Templates</h1>
            {usage && (
              <Badge variant="purple" size="sm">
                {usage.templateCount} / {usage.templateLimit} Used
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">Manage, edit, and publish email templates</p>
        </div>
        <Link href="/dashboard/templates/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>Create Template</Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search name or slug..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            setIsLoading(true);
          }}
          leftIcon={<Search className="w-4 h-4" />}
        />

        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as TemplateStatus);
            setPage(1);
            setIsLoading(true);
          }}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'ARCHIVED', label: 'Archived' },
          ]}
        />

        <Select
          value={editorTypeFilter}
          onChange={(e) => {
            setEditorTypeFilter(e.target.value as EditorType);
            setPage(1);
            setIsLoading(true);
          }}
          options={[
            { value: '', label: 'All Editors' },
            { value: 'CODE', label: 'Code Editor' },
            { value: 'BUILDER', label: 'Visual Builder' },
          ]}
        />
      </div>

      {/* Templates Table Container */}
      {isLoading ? (
        <LoadingSpinner label="Fetching templates..." />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<FileCode className="w-10 h-10 text-zinc-500" />}
          title="No templates found"
          description="Create your first transactional email template to get started."
          actionLabel="Create Template"
          onAction={() => router.push('/dashboard/templates/new')}
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Version</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((tpl) => (
                <TableRow key={tpl.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/dashboard/templates/${tpl.id}`}
                        className="font-semibold text-zinc-100 hover:text-indigo-400 transition-colors"
                      >
                        {tpl.name}
                      </Link>
                      {tpl.description && (
                        <p className="text-xs text-zinc-400 truncate max-w-xs">{tpl.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-400">{tpl.slug}</TableCell>
                  <TableCell>
                    <Badge variant={tpl.editorType === 'CODE' ? 'info' : 'purple'} size="sm" dot={false}>
                      {tpl.editorType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tpl.status === 'ACTIVE'
                          ? 'success'
                          : tpl.status === 'ARCHIVED'
                          ? 'neutral'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {tpl.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-zinc-300">
                    {tpl.currentVersion ? `v${tpl.currentVersion.version}` : 'No version'}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {new Date(tpl.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="API Integration Snippet"
                        onClick={() => setCodeModalTarget(tpl)}
                      >
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      </Button>
                      <Link href={`/dashboard/templates/${tpl.id}`}>
                        <Button variant="ghost" size="sm" title="Edit Template">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/templates/${tpl.id}/versions`}>
                        <Button variant="ghost" size="sm" title="Version History">
                          <History className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      {tpl.status !== 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Activate Template"
                          onClick={() => setActivateTarget(tpl)}
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </Button>
                      )}
                      {tpl.status !== 'ARCHIVED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Archive Template"
                          onClick={() => setArchiveTarget(tpl)}
                        >
                          <Archive className="w-3.5 h-3.5 text-rose-400" />
                        </Button>
                      )}
                    </div>
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

      {/* Code Snippet Modal */}
      {codeModalTarget && (
        <SendApiCodeModal
          isOpen={Boolean(codeModalTarget)}
          onClose={() => setCodeModalTarget(null)}
          template={codeModalTarget}
        />
      )}

      {/* Activate Confirmation Modal */}
      <Modal
        isOpen={Boolean(activateTarget)}
        onClose={() => setActivateTarget(null)}
        title="Activate Template"
        description={`Are you sure you want to activate "${activateTarget?.name}"?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setActivateTarget(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleActivate} isLoading={actionLoading}>
              Activate Template
            </Button>
          </>
        }
      >
        <p className="text-xs text-zinc-300">
          Activating this template will make version{' '}
          <span className="font-semibold text-emerald-400">v{activateTarget?.currentVersion?.version || 1}</span>{' '}
          live for transactional emails sent via the API.
        </p>
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archive Template"
        description={`Are you sure you want to archive "${archiveTarget?.name}"?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setArchiveTarget(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleArchive} isLoading={actionLoading}>
              Archive Template
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Archived templates will no longer respond to transactional send requests.</span>
        </div>
      </Modal>
    </div>
  );
}
