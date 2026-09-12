'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Template, TemplateVersionDetail } from '@/types';
import { createTemplateVersionApi, updateTemplateApi, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import {
  createBlock,
  createDefaultDocument,
  createOneColumnRow,
  createSection,
  createThreeColumnRow,
  createTwoColumnRow,
  generateId,
} from '../model/defaults';
import { deserializeBuilder, serializeBuilder } from '../model/serialization';
import {
  BuilderBlock,
  BuilderBlockType,
  BuilderColumn,
  BuilderDocument,
  BuilderRow,
  BuilderSection,
  LayoutType,
  SelectedTarget,
} from '../model/types';
import { validateBuilderDocument } from '../model/validation';
import { generateEmailHtml } from '../renderer/renderEmail';
import { validateVariableSyntax } from '../utils/variableUtils';
import { useUndoRedo } from '../history/useUndoRedo';
import { usePointerDrag } from '../hooks/usePointerDrag';
import { BuilderTopBar } from './BuilderTopBar';
import { ComponentPalette } from './ComponentPalette';
import { EmailCanvas } from './EmailCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { PreviewModal } from './PreviewModal';
import { HtmlViewerModal } from './HtmlViewerModal';
import { Modal, Input, Button } from '@/components/ui';
import { testSmtpApi } from '@/lib/api/smtp.api';

export interface VisualEmailBuilderProps {
  template: Template;
  initialVersionDetail?: TemplateVersionDetail | null;
  onSaved?: (updatedTemplate: Template) => void;
}

export function VisualEmailBuilder({ template, initialVersionDetail, onSaved }: VisualEmailBuilderProps) {
  const { addToast } = useToast();

  // Initialize document AST from initialVersionDetail.builderContent or fallback to default
  const initialDoc = useMemo(() => {
    if (initialVersionDetail?.builderContent) {
      return deserializeBuilder(initialVersionDetail.builderContent);
    }
    return createDefaultDocument();
  }, [initialVersionDetail]);

  const { doc, setDoc, undo, redo, canUndo, canRedo } = useUndoRedo(initialDoc);

  const [subject, setSubject] = useState(template.subject || '');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>({ type: 'document' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHtmlOpen, setIsHtmlOpen] = useState(false);
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const { startDrag } = usePointerDrag();

  // Mark dirty when doc or subject changes
  const handleDocChange = useCallback((updater: (prev: BuilderDocument) => BuilderDocument) => {
    setDoc(updater);
    setIsDirty(true);
  }, [setDoc]);

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    setIsDirty(true);
  };

  // Warn user on window unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Insert Layout structure
  const handleAddLayout = (layoutType: LayoutType) => {
    handleDocChange((prev) => {
      let newRow: BuilderRow;
      if (layoutType === 'row-1') newRow = createOneColumnRow();
      else if (layoutType === 'row-2') newRow = createTwoColumnRow();
      else if (layoutType === 'row-3') newRow = createThreeColumnRow();
      else {
        return {
          ...prev,
          children: [...prev.children, createSection()],
        };
      }

      if (prev.children.length === 0) {
        return { ...prev, children: [createSection([newRow])] };
      }

      const updated = [...prev.children];
      const targetSec = updated[updated.length - 1];
      updated[updated.length - 1] = {
        ...targetSec,
        children: [...targetSec.children, newRow],
      };
      return { ...prev, children: updated };
    });
  };

  // Insert Block directly or into selected column
  const handleAddBlock = (blockType: BuilderBlockType) => {
    const newBlock = createBlock(blockType);
    handleDocChange((prev) => {
      if (prev.children.length === 0) {
        return {
          ...prev,
          children: [createSection([createOneColumnRow([newBlock])])],
        };
      }

      const updated = [...prev.children];
      const lastSecIdx = updated.length - 1;
      const sec = updated[lastSecIdx];

      if (sec.children.length === 0) {
        updated[lastSecIdx] = { ...sec, children: [createOneColumnRow([newBlock])] };
        return { ...prev, children: updated };
      }

      const lastRowIdx = sec.children.length - 1;
      const row = sec.children[lastRowIdx];

      if (row.columns.length === 0) {
        const newCol: BuilderColumn = {
          id: generateId('col'),
          type: 'column',
          width: 100,
          props: { padding: 12 },
          children: [newBlock],
        };
        const updatedRow = { ...row, columns: [newCol] };
        const updatedRows = [...sec.children];
        updatedRows[lastRowIdx] = updatedRow;
        updated[lastSecIdx] = { ...sec, children: updatedRows };
        return { ...prev, children: updated };
      }

      const firstCol = row.columns[0];
      const updatedCol = { ...firstCol, children: [...firstCol.children, newBlock] };
      const updatedCols = [...row.columns];
      updatedCols[0] = updatedCol;
      const updatedRows = [...sec.children];
      updatedRows[lastRowIdx] = { ...row, columns: updatedCols };
      updated[lastSecIdx] = { ...sec, children: updatedRows };
      return { ...prev, children: updated };
    });

    setSelectedTarget({ type: 'block', id: newBlock.id, columnId: '', rowId: '', sectionId: '' });
  };

  // Document Settings updates
  const handleUpdateDocumentSettings = (newSettings: Record<string, unknown>) => {
    handleDocChange((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  // Section Props updates
  const handleUpdateSectionProps = (sectionId: string, props: Record<string, unknown>) => {
    handleDocChange((prev) => ({
      ...prev,
      children: prev.children.map((s) => (s.id === sectionId ? { ...s, props: { ...s.props, ...props } } : s)),
    }));
  };

  // Row Props updates
  const handleUpdateRowProps = (rowId: string, props: Record<string, unknown>) => {
    handleDocChange((prev) => ({
      ...prev,
      children: prev.children.map((s) => ({
        ...s,
        children: s.children.map((r) => (r.id === rowId ? { ...r, props: { ...r.props, ...props } } : r)),
      })),
    }));
  };

  // Column Props updates
  const handleUpdateColumnProps = (columnId: string, props: Record<string, unknown>) => {
    handleDocChange((prev) => ({
      ...prev,
      children: prev.children.map((s) => ({
        ...s,
        children: s.children.map((r) => ({
          ...r,
          columns: r.columns.map((c) => (c.id === columnId ? { ...c, props: { ...c.props, ...props } } : c)),
        })),
      })),
    }));
  };

  // Row Columns width resize update
  const handleUpdateRowColumns = (rowId: string, newColumns: BuilderColumn[]) => {
    handleDocChange((prev) => ({
      ...prev,
      children: prev.children.map((s) => ({
        ...s,
        children: s.children.map((r) => (r.id === rowId ? { ...r, columns: newColumns } : r)),
      })),
    }));
  };

  // Block Props updates
  const handleUpdateBlockProps = (blockId: string, props: Record<string, unknown>) => {
    handleDocChange((prev) => ({
      ...prev,
      children: prev.children.map((s) => ({
        ...s,
        children: s.children.map((r) => ({
          ...r,
          columns: r.columns.map((c) => ({
            ...c,
            children: c.children.map((b) => (b.id === blockId ? ({ ...b, props: { ...b.props, ...props } } as BuilderBlock) : b)),
          })),
        })),
      })),
    }));
  };

  // Move block up/down within column
  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    handleDocChange((prev) => ({
      ...prev,
      children: prev.children.map((s) => ({
        ...s,
        children: s.children.map((r) => ({
          ...r,
          columns: r.columns.map((c) => {
            const idx = c.children.findIndex((b) => b.id === blockId);
            if (idx === -1) return c;
            const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (targetIdx < 0 || targetIdx >= c.children.length) return c;

            const updatedBlocks = [...c.children];
            const [moved] = updatedBlocks.splice(idx, 1);
            updatedBlocks.splice(targetIdx, 0, moved);
            return { ...c, children: updatedBlocks };
          }),
        })),
      })),
    }));
  };

  // Duplicate Block
  const handleDuplicateBlock = (blockId: string) => {
    handleDocChange((prev) => ({
      ...prev,
      children: prev.children.map((s) => ({
        ...s,
        children: s.children.map((r) => ({
          ...r,
          columns: r.columns.map((c) => {
            const idx = c.children.findIndex((b) => b.id === blockId);
            if (idx === -1) return c;
            const original = c.children[idx];
            const clone: BuilderBlock = {
              ...JSON.parse(JSON.stringify(original)),
              id: generateId(`block-${original.type}`),
            };
            const updated = [...c.children];
            updated.splice(idx + 1, 0, clone);
            return { ...c, children: updated };
          }),
        })),
      })),
    }));
  };

  // Delete Block
  const handleDeleteBlock = (blockId: string) => {
    handleDocChange((prev) => ({
      ...prev,
      children: prev.children.map((s) => ({
        ...s,
        children: s.children.map((r) => ({
          ...r,
          columns: r.columns.map((c) => ({
            ...c,
            children: c.children.filter((b) => b.id !== blockId),
          })),
        })),
      })),
    }));
    setSelectedTarget({ type: 'document' });
  };

  // Move Section
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    handleDocChange((prev) => {
      const idx = prev.children.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.children.length) return prev;

      const updated = [...prev.children];
      const [moved] = updated.splice(idx, 1);
      updated.splice(targetIdx, 0, moved);
      return { ...prev, children: updated };
    });
  };

  // Duplicate Section
  const handleDuplicateSection = (sectionId: string) => {
    handleDocChange((prev) => {
      const idx = prev.children.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      const original = prev.children[idx];
      const clone: BuilderSection = {
        ...JSON.parse(JSON.stringify(original)),
        id: generateId('sec'),
      };
      const updated = [...prev.children];
      updated.splice(idx + 1, 0, clone);
      return { ...prev, children: updated };
    });
  };

  // Delete Section
  const handleDeleteSection = (sectionId: string) => {
    handleDocChange((prev) => {
      if (prev.children.length <= 1) return prev;
      return {
        ...prev,
        children: prev.children.filter((s) => s.id !== sectionId),
      };
    });
    setSelectedTarget({ type: 'document' });
  };

  // Add Row to Section
  const handleAddRowToSection = (sectionId: string, layoutType: 'row-1' | 'row-2' | 'row-3') => {
    handleDocChange((prev) => {
      let newRow: BuilderRow;
      if (layoutType === 'row-1') newRow = createOneColumnRow();
      else if (layoutType === 'row-2') newRow = createTwoColumnRow();
      else newRow = createThreeColumnRow();

      return {
        ...prev,
        children: prev.children.map((s) => (s.id === sectionId ? { ...s, children: [...s.children, newRow] } : s)),
      };
    });
  };

  // Synchronized Save Pipeline
  const handleSave = async () => {
    // 0. Validate Subject variable syntax
    const subjectErr = validateVariableSyntax(subject);
    if (subjectErr) {
      addToast({
        type: 'error',
        title: 'Malformed Subject Line',
        message: subjectErr,
      });
      return;
    }

    // 1. Validate AST document
    const validation = validateBuilderDocument(doc);
    if (!validation.valid) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: validation.errors[0] || 'Invalid template structure.',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Update template subject if changed
      if (subject.trim() !== template.subject) {
        await updateTemplateApi(template.id, { subject: subject.trim() });
      }

      // 2. Serialize builderContent JSON
      const serializedBuilder = serializeBuilder(doc);

      // 3. Compile email-safe HTML from exact same AST state
      const compiledHtml = generateEmailHtml(doc);

      // 4. Create new backend version
      const newVersionDetail = await createTemplateVersionApi(template.id, {
        html: compiledHtml,
        builderContent: serializedBuilder,
      });

      setIsDirty(false);
      addToast({
        type: 'success',
        title: 'Version Created',
        message: `Successfully created template version v${newVersionDetail.version}`,
      });

      onSaved?.(template);
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Save Failed', message: err.message });
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Failed to save template version.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Send Test Email Action
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim()) return;

    setIsSendingTest(true);
    try {
      await testSmtpApi({
        to: testRecipient.trim(),
      });

      addToast({
        type: 'success',
        title: 'Test Email Sent',
        message: `Test email sent to ${testRecipient}`,
      });
      setIsTestEmailOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Send Failed', message: err.message });
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Failed to send test email.' });
      }
    } finally {
      setIsSendingTest(false);
    }
  };

  const compiledHtml = useMemo(() => generateEmailHtml(doc), [doc]);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Action Header */}
      <BuilderTopBar
        templateName={template.name}
        templateStatus={template.status}
        versionNumber={initialVersionDetail?.version}
        subject={subject}
        onSubjectChange={handleSubjectChange}
        deviceView={deviceView}
        onDeviceViewChange={setDeviceView}
        viewTab="design"
        onViewTabChange={(tab) => {
          if (tab === 'preview') setIsPreviewOpen(true);
          else if (tab === 'html') setIsHtmlOpen(true);
        }}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onSendTestEmail={() => setIsTestEmailOpen(true)}
      />

      {/* Main Visual Editor Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Palette Panel */}
        <ComponentPalette
          onStartDrag={(item, e) => startDrag(item, e)}
          onAddLayout={handleAddLayout}
          onAddBlock={handleAddBlock}
        />

        {/* Center: Email Editing Canvas */}
        <EmailCanvas
          doc={doc}
          selectedTarget={selectedTarget}
          deviceView={deviceView}
          onSelectTarget={setSelectedTarget}
          onUpdateRowColumns={handleUpdateRowColumns}
          onUpdateBlockProps={handleUpdateBlockProps}
          onMoveBlock={handleMoveBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onDeleteBlock={handleDeleteBlock}
          onMoveSection={handleMoveSection}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={handleDeleteSection}
          onAddRow={handleAddRowToSection}
        />

        {/* Right: Properties Inspector Panel */}
        {selectedTarget && (
          <PropertiesPanel
            doc={doc}
            selectedTarget={selectedTarget}
            onUpdateDocumentSettings={handleUpdateDocumentSettings}
            onUpdateSectionProps={handleUpdateSectionProps}
            onUpdateRowProps={handleUpdateRowProps}
            onUpdateColumnProps={handleUpdateColumnProps}
            onUpdateBlockProps={handleUpdateBlockProps}
            onClose={() => setSelectedTarget(null)}
          />
        )}
      </div>

      {/* Modals */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        html={compiledHtml}
      />

      <HtmlViewerModal
        isOpen={isHtmlOpen}
        onClose={() => setIsHtmlOpen(false)}
        html={compiledHtml}
      />

      {/* Test Email Modal */}
      <Modal
        isOpen={isTestEmailOpen}
        onClose={() => setIsTestEmailOpen(false)}
        title="Send Test Email"
        description="Send a real test email using the currently configured SMTP credentials."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsTestEmailOpen(false)} disabled={isSendingTest}>
              Cancel
            </Button>
            <Button onClick={handleSendTestEmail} isLoading={isSendingTest}>
              Send Test Email
            </Button>
          </>
        }
      >
        <form onSubmit={handleSendTestEmail} className="space-y-4">
          <Input
            label="Recipient Email Address *"
            type="email"
            placeholder="you@example.com"
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            required
          />
          <p className="text-xs text-zinc-400">
            This will render the current template HTML and deliver it via your active organization SMTP configuration.
          </p>
        </form>
      </Modal>
    </div>
  );
}
