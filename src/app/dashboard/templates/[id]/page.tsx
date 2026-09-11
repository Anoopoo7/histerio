'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  History,
  Code2,
  Eye,
  Variable,
  Sparkles,
} from 'lucide-react';
import {
  getTemplateByIdApi,
  getTemplateVersionsApi,
  getTemplateVersionByNumberApi,
  createTemplateVersionApi,
  activateTemplateApi,
  updateTemplateApi,
  ApiError,
} from '@/lib/api';
import { Template, TemplateVersionDetail } from '@/types';
import {
  Button,
  Input,
  Badge,
  Card,
  LoadingSpinner,
  SandboxedIframe,
} from '@/components/ui';
import { useToast } from '@/hooks/useToast';

export default function CodeTemplateEditorPage() {
  const params = useParams();
  const templateId = params.id as string;
  const { addToast } = useToast();

  const [template, setTemplate] = useState<Template | null>(null);
  const [currentVersion, setCurrentVersion] = useState<TemplateVersionDetail | null>(null);

  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('<html>\n  <body>\n    <h1>Hello {{customer.name}}</h1>\n    <p>Your order {{order.id}} has been processed.</p>\n  </body>\n</html>');
  const [mockDataJson, setMockDataJson] = useState('{\n  "customer": { "name": "John Doe" },\n  "order": { "id": "ORD-98231" }\n}');

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [isUpdatingSubject, setIsUpdatingSubject] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getTemplateByIdApi(templateId).then(async (tpl) => {
      if (!isMounted) return;
      setTemplate(tpl);
      setSubject(tpl.subject);

      if (tpl.currentVersion) {
        try {
          const verDetail = await getTemplateVersionByNumberApi(
            templateId,
            tpl.currentVersion.version
          );
          if (isMounted) {
            setCurrentVersion(verDetail);
            setHtml(verDetail.html);
          }
        } catch {
          // Version detail fetch fallback
        }
      } else {
        try {
          const versions = await getTemplateVersionsApi(templateId);
          if (versions.length > 0 && isMounted) {
            const latestVer = versions[0];
            const verDetail = await getTemplateVersionByNumberApi(
              templateId,
              latestVer.version
            );
            if (isMounted) {
              setCurrentVersion(verDetail);
              setHtml(verDetail.html);
            }
          }
        } catch {
          // Fallback
        }
      }
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [templateId]);

  // Extract variables dynamically using regex {{variable}}
  const detectedVariables = useMemo(() => {
    const textToScan = `${subject} ${html}`;
    const regex = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
    const vars = new Set<string>();
    let match;
    while ((match = regex.exec(textToScan)) !== null) {
      if (match[1]) {
        vars.add(match[1]);
      }
    }
    return Array.from(vars);
  }, [subject, html]);

  // Compute rendered HTML for live preview with sample replacement data
  const renderedHtmlPreview = useMemo(() => {
    let output = html;
    try {
      const data = JSON.parse(mockDataJson);

      const getValueByPath = (obj: Record<string, unknown>, path: string): string => {
        const parts = path.split('.');
        let curr: unknown = obj;
        for (const p of parts) {
          if (curr && typeof curr === 'object' && p in (curr as Record<string, unknown>)) {
            curr = (curr as Record<string, unknown>)[p];
          } else {
            return `{{${path}}}`;
          }
        }
        return String(curr);
      };

      detectedVariables.forEach((varPath) => {
        const value = getValueByPath(data, varPath);
        const replaceRegex = new RegExp(`\\{\\{\\s*${varPath.replace('.', '\\.')}\\s*\\}\\}`, 'g');
        output = output.replace(replaceRegex, value);
      });
    } catch {
      // Return raw HTML if JSON parse fails
    }
    return output;
  }, [html, mockDataJson, detectedVariables]);

  const handleUpdateSubject = async () => {
    if (!subject.trim() || !template) return;
    setIsUpdatingSubject(true);
    try {
      const updated = await updateTemplateApi(template.id, { subject: subject.trim() });
      setTemplate(updated);
      addToast({
        type: 'success',
        title: 'Subject Saved',
        message: 'Template subject template updated.',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Update Failed', message: err.message });
      }
    } finally {
      setIsUpdatingSubject(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!html.trim() || !template) return;
    setIsSavingVersion(true);
    try {
      if (subject !== template.subject) {
        await updateTemplateApi(template.id, { subject: subject.trim() });
      }

      const newVer = await createTemplateVersionApi(template.id, {
        html,
        builderContent: {},
      });

      setCurrentVersion(newVer);

      const reloaded = await getTemplateByIdApi(template.id);
      setTemplate(reloaded);

      addToast({
        type: 'success',
        title: 'Version Created',
        message: `Successfully created template version v${newVer.version}`,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Save Failed', message: err.message });
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Failed to create new template version' });
      }
    } finally {
      setIsSavingVersion(false);
    }
  };

  const handleActivate = async () => {
    if (!template) return;
    setIsActivating(true);
    try {
      const activated = await activateTemplateApi(template.id);
      setTemplate(activated);
      addToast({
        type: 'success',
        title: 'Template Activated',
        message: `"${activated.name}" is now live and ready to send emails.`,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Activation Error', message: err.message });
      }
    } finally {
      setIsActivating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading template editor..." />;
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-400">Template not found.</p>
        <Link href="/dashboard/templates" className="mt-4 inline-block">
          <Button variant="outline">Back to Templates</Button>
        </Link>
      </div>
    );
  }

  if (template.editorType === 'BUILDER') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/templates">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">{template.name}</h1>
              <p className="text-xs text-zinc-400">Visual Drag & Drop Builder Mode</p>
            </div>
          </div>
          <Link href={`/dashboard/templates/${template.id}/versions`}>
            <Button variant="outline" size="sm" leftIcon={<History className="w-4 h-4" />}>
              Version History
            </Button>
          </Link>
        </div>

        <Card className="p-12 text-center bg-purple-500/5 border-purple-500/20">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-zinc-100">Visual Builder Placeholder</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
            This template is set to <span className="font-semibold text-purple-400">BUILDER</span> mode. The full visual block editor is under development and scheduled for release.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard/templates/new">
              <Button variant="outline" leftIcon={<Code2 className="w-4 h-4" />}>
                Create New Code Template
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Editor Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/templates">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">{template.name}</h1>
              <Badge
                variant={
                  template.status === 'ACTIVE'
                    ? 'success'
                    : template.status === 'ARCHIVED'
                    ? 'neutral'
                    : 'warning'
                }
                size="sm"
              >
                {template.status}
              </Badge>
              {currentVersion && (
                <Badge variant="info" size="sm" dot={false}>
                  v{currentVersion.version}
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">Slug: {template.slug}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/templates/${template.id}/versions`}>
            <Button variant="outline" size="sm" leftIcon={<History className="w-4 h-4" />}>
              Versions
            </Button>
          </Link>

          {template.status !== 'ACTIVE' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleActivate}
              isLoading={isActivating}
              leftIcon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
            >
              Activate
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSaveVersion}
            isLoading={isSavingVersion}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save New Version
          </Button>
        </div>
      </div>

      {/* Subject Line Bar */}
      <Card className="p-4 bg-zinc-900/90 border-zinc-800/90">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <Input
              label="Email Subject Line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Your order {{order.id}} has shipped"
            />
          </div>
          {subject !== template.subject && (
            <div className="sm:self-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateSubject}
                isLoading={isUpdatingSubject}
              >
                Save Subject
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Main Split Grid: Code Editor on Left, Live Sandboxed Preview & Variables on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: HTML Source Editor */}
        <Card className="flex flex-col h-[650px] border-zinc-800">
          <div className="p-3 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-zinc-300">HTML Source Code</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">Immutable Versioning</span>
          </div>

          <div className="flex-1 p-3 bg-zinc-950 font-mono text-xs text-zinc-200 overflow-hidden">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full h-full bg-transparent border-0 focus:outline-none resize-none font-mono text-xs leading-relaxed text-emerald-300/90 placeholder-zinc-700"
              placeholder="<html><body><h1>Hello World</h1></body></html>"
              spellCheck={false}
            />
          </div>
        </Card>

        {/* Right Column: Live Sandboxed Preview & Variable Extractor */}
        <div className="flex flex-col gap-6 h-[650px] overflow-y-auto pr-1">
          {/* Detected Variables Panel */}
          <Card className="p-4 border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Variable className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-semibold text-zinc-300">Detected Template Variables</h3>
              </div>
              <span className="text-[11px] font-semibold text-zinc-400">{detectedVariables.length} found</span>
            </div>
            {detectedVariables.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">
                No variables detected. Add Mustache tags like <code className="text-zinc-300">{`{{user.name}}`}</code> in subject or HTML.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {detectedVariables.map((v) => (
                  <span
                    key={v}
                    className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs rounded-md"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Test Replacement Payload JSON */}
          <Card className="p-4 border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300">Test Preview Data (JSON)</span>
              <span className="text-[11px] text-zinc-500">Replaces variables in preview</span>
            </div>
            <textarea
              value={mockDataJson}
              onChange={(e) => setMockDataJson(e.target.value)}
              className="w-full h-24 p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none"
            />
          </Card>

          {/* Sandboxed Live HTML Iframe Preview */}
          <Card className="flex-1 flex flex-col border-zinc-800">
            <div className="p-3 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-zinc-300">Sandboxed Email Preview</span>
              </div>
              <Badge variant="success" size="sm" dot={false}>
                Isolated Sandbox
              </Badge>
            </div>
            <div className="p-3 flex-1 bg-zinc-950">
              <SandboxedIframe html={renderedHtmlPreview} minHeight="260px" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
