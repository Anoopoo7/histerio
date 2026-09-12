'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Code2, Layout, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { createTemplateApi, ApiError } from '@/lib/api';
import { EditorType } from '@/types';
import { Button, Input, Card, CardContent, Badge } from '@/components/ui';
import { useToast } from '@/hooks/useToast';

export default function CreateTemplatePage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [editorType, setEditorType] = useState<EditorType>('CODE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLimitReached, setIsLimitReached] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) {
      setError('Name and Subject are required fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsLimitReached(false);

    try {
      const template = await createTemplateApi({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        subject: subject.trim(),
        editorType,
      });

      addToast({
        type: 'success',
        title: 'Template Created',
        message: `Successfully created template "${template.name}"`,
      });

      router.push(`/dashboard/templates/${template.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'TEMPLATE_LIMIT_REACHED' || err.statusCode === 403) {
          setIsLimitReached(true);
          setError('Template limit reached. Upgrade your plan to create more templates.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to create template');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/templates">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Create Email Template</h1>
          <p className="text-xs text-zinc-400">Set up template metadata and choose an editor mode</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isLimitReached ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Template Limit Reached</span>
                </div>
                <p className="leading-relaxed">
                  Your current subscription plan limit has been reached. Upgrade your plan to create additional email templates.
                </p>
                <div className="pt-1">
                  <Link href="/dashboard/billing">
                    <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      View Billing & Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </div>
            ) : error ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
                {error}
              </div>
            ) : null}

            {/* Editor Type Selector Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">Editor Experience</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setEditorType('CODE')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    editorType === 'CODE'
                      ? 'bg-indigo-500/10 border-indigo-500 text-zinc-100 shadow-md'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Code2 className={`w-5 h-5 ${editorType === 'CODE' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    <Badge variant={editorType === 'CODE' ? 'info' : 'neutral'} size="sm" dot={false}>
                      HTML Code
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-200">Code Editor</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Write custom HTML with Mustache variable templates and live rendering.
                  </p>
                </div>

                <div
                  onClick={() => setEditorType('BUILDER')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    editorType === 'BUILDER'
                      ? 'bg-purple-500/10 border-purple-500 text-zinc-100 shadow-md'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Layout className={`w-5 h-5 ${editorType === 'BUILDER' ? 'text-purple-400' : 'text-zinc-500'}`} />
                    <Badge variant={editorType === 'BUILDER' ? 'purple' : 'neutral'} size="sm" dot={false}>
                      Drag & Drop
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-200">Visual Builder</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    No-code visual email composer with modular content blocks.
                  </p>
                </div>
              </div>

              {editorType === 'BUILDER' && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300 flex items-center gap-2 mt-3">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    Note: The Visual Builder placeholder is enabled. Full drag & drop features will be released in an upcoming update.
                  </span>
                </div>
              )}
            </div>

            {/* Template Fields */}
            <div className="space-y-4">
              <Input
                label="Template Name *"
                placeholder="e.g. Order Shipped Notification"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />

              <Input
                label="Slug"
                placeholder="order-shipped-notification"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                helperText="Identifier used when calling the transactional API. Auto-generated if blank."
              />

              <Input
                label="Email Subject *"
                placeholder="Your order {{order.id}} has shipped!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                helperText="Supports Handlebars/Mustache variables like {{customer.name}}"
              />

              <Input
                label="Description"
                placeholder="Email sent to customers when their order leaves the warehouse."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <Link href="/dashboard/templates">
                <Button variant="outline" type="button" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isLoading} disabled={isLimitReached}>
                Create & Continue to Editor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
