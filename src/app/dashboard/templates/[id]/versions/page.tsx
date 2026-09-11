'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
} from 'lucide-react';
import {
  getTemplateByIdApi,
  getTemplateVersionsApi,
  getTemplateVersionByNumberApi,
  setTemplateCurrentVersionApi,
  ApiError,
} from '@/lib/api';
import { Template, TemplateVersionDetail, TemplateVersionSummary } from '@/types';
import {
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  Modal,
  SandboxedIframe,
} from '@/components/ui';
import { useToast } from '@/hooks/useToast';

export default function TemplateVersionsPage() {
  const params = useParams();
  const templateId = params.id as string;
  const { addToast } = useToast();

  const [template, setTemplate] = useState<Template | null>(null);
  const [versions, setVersions] = useState<TemplateVersionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View Version Detail Modal State
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersionDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Set Current Version Action State
  const [settingCurrentVer, setSettingCurrentVer] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getTemplateByIdApi(templateId),
      getTemplateVersionsApi(templateId),
    ]).then(([tpl, verList]) => {
      if (!isMounted) return;
      setTemplate(tpl);
      setVersions(verList);
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [templateId]);

  const handleViewVersion = async (verNum: number) => {
    setModalLoading(true);
    setIsModalOpen(true);
    try {
      const detail = await getTemplateVersionByNumberApi(templateId, verNum);
      setSelectedVersion(detail);
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Error', message: err.message });
      }
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSetCurrentVersion = async (verNum: number) => {
    setSettingCurrentVer(verNum);
    try {
      const updated = await setTemplateCurrentVersionApi(templateId, verNum);
      setTemplate(updated);
      addToast({
        type: 'success',
        title: 'Current Version Updated',
        message: `Version v${verNum} is now set as current.`,
      });
      // Refresh list
      const verList = await getTemplateVersionsApi(templateId);
      setVersions(verList);
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Error', message: err.message });
      }
    } finally {
      setSettingCurrentVer(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading version history..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/templates/${templateId}`}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Editor
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Version History</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Template: <span className="font-semibold text-zinc-200">{template?.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Version History Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Variables</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((ver) => {
              const isCurrent = ver.isCurrent;
              return (
                <TableRow key={ver.id} className={isCurrent ? 'bg-indigo-500/5' : ''}>
                  <TableCell className="font-mono font-bold text-zinc-100">v{ver.version}</TableCell>
                  <TableCell>
                    {isCurrent ? (
                      <Badge variant="success" size="sm">
                        Current Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm" dot={false}>
                        Older Version
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {ver.variables.length === 0 ? (
                        <span className="text-xs text-zinc-500 italic">None</span>
                      ) : (
                        ver.variables.map((v) => {
                          const varName = typeof v === 'string' ? v : v.path;
                          return (
                            <span
                              key={varName}
                              className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px] rounded"
                            >
                              {varName}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-400">
                    {ver.createdBy || 'User'}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {new Date(ver.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewVersion(ver.version)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View
                      </Button>
                      {!isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={settingCurrentVer === ver.version}
                          onClick={() => handleSetCurrentVersion(ver.version)}
                          leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        >
                          Set as Current
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* View Version Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Version v${selectedVersion?.version || ''} Preview`}
        description="Immutable snapshot of template HTML and variables."
        maxWidth="lg"
        footer={
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        }
      >
        {modalLoading ? (
          <LoadingSpinner label="Loading version content..." />
        ) : selectedVersion ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
              <span>
                Created: <strong className="text-zinc-200">{new Date(selectedVersion.createdAt).toLocaleString()}</strong>
              </span>
              {selectedVersion.isCurrent && <Badge variant="success" size="sm">Current Version</Badge>}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-300 mb-1">Sandboxed HTML Preview</h4>
              <SandboxedIframe html={selectedVersion.html} minHeight="300px" />
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-300 mb-1">HTML Source</h4>
              <pre className="p-3 bg-zinc-950 rounded-lg text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-48">
                {selectedVersion.html}
              </pre>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
