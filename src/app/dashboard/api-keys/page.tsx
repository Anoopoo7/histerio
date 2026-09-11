'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import {
  getApiKeysApi,
  createApiKeyApi,
  revokeApiKeyApi,
  ApiError,
} from '@/lib/api';
import { ApiKey, ApiKeyCreated } from '@/types';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
  Modal,
} from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/useToast';

export default function ApiKeysPage() {
  const { currentOrg } = useOrganization();
  const { addToast } = useToast();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // One-time secret display modal
  const [createdSecret, setCreatedSecret] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);

  // Revoke modal
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const loadKeys = useCallback(async () => {
    if (!currentOrg) return;
    setIsLoading(true);
    try {
      const list = await getApiKeysApi();
      setKeys(list);
    } catch {
      // Error fetching API keys
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    let isMounted = true;
    if (!currentOrg) return;
    getApiKeysApi().then((list) => {
      if (!isMounted) return;
      setKeys(list);
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [currentOrg]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setCreateError('API Key name is required');
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      const res = await createApiKeyApi({
        name: name.trim(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });

      setIsCreateOpen(false);
      setName('');
      setExpiresAt('');

      setCreatedSecret(res);
      loadKeys();
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateError(err.message);
      } else {
        setCreateError('Failed to generate API key');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopySecret = () => {
    if (!createdSecret?.key) return;
    navigator.clipboard.writeText(createdSecret.key);
    setCopied(true);
    addToast({ type: 'success', title: 'Copied', message: 'API key copied to clipboard.' });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      await revokeApiKeyApi(revokeTarget.id);
      addToast({
        type: 'success',
        title: 'API Key Revoked',
        message: `Key "${revokeTarget.name}" was revoked successfully.`,
      });
      setRevokeTarget(null);
      loadKeys();
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Revoke Error', message: err.message });
      }
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">API Keys</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Authenticate requests to the public mail API (<code className="text-zinc-300">POST /v1/emails/send</code>)
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create New API Key
        </Button>
      </div>

      {/* Keys Table */}
      {isLoading ? (
        <LoadingSpinner label="Fetching API keys..." />
      ) : keys.length === 0 ? (
        <EmptyState
          icon={<Key className="w-10 h-10 text-zinc-500" />}
          title="No API Keys Generated"
          description="Create an API key to allow server-to-server email dispatch."
          actionLabel="Create API Key"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => {
                const isRevoked = Boolean(key.revokedAt);
                return (
                  <TableRow key={key.id}>
                    <TableCell className="font-semibold text-zinc-100">{key.name}</TableCell>
                    <TableCell className="font-mono text-xs text-zinc-300">
                      {key.keyPrefix}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={isRevoked ? 'error' : 'success'} size="sm">
                        {isRevoked ? 'Revoked' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isRevoked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokeTarget(key)}
                          leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create API Key Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create API Key"
        description="Generate a new secret token for sending emails."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={isCreating}>
              Generate Secret Key
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
              {createError}
            </div>
          )}

          <Input
            label="Key Name *"
            placeholder="e.g. Production Backend"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Expiration Date (Optional)"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            helperText="Leave empty for non-expiring key"
          />
        </form>
      </Modal>

      {/* One-Time Secret Display Modal */}
      <Modal
        isOpen={Boolean(createdSecret)}
        onClose={() => setCreatedSecret(null)}
        title="API Key Created Successfully"
        maxWidth="lg"
        footer={
          <Button
            onClick={() => setCreatedSecret(null)}
            className="w-full sm:w-auto"
          >
            I Have Saved This Key
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Save your API key now!</p>
              <p className="mt-1">
                This key will only be shown once. Copy it now and store it in a secure password manager or environment variable.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Secret API Key</label>
            <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-emerald-300 break-all">
              <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="flex-1 select-all">{createdSecret?.key}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopySecret}
                leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Revoke Confirmation Modal */}
      <Modal
        isOpen={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        title="Revoke API Key"
        description={`Are you sure you want to revoke "${revokeTarget?.name}"?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setRevokeTarget(null)} disabled={isRevoking}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevoke} isLoading={isRevoking}>
              Revoke Key
            </Button>
          </>
        }
      >
        <p className="text-xs text-zinc-400">
          Any applications using this API key will immediately lose access to the mail dispatch endpoint.
        </p>
      </Modal>
    </div>
  );
}
