export type TemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type EditorType = 'CODE' | 'BUILDER';

export interface TemplateVariable {
  path: string;
  type: string;
  required: boolean;
}

export interface CurrentVersionSummary {
  id: string;
  version: number;
  variables: TemplateVariable[] | string[];
  createdAt: string;
}

export interface Template {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  subject: string;
  editorType: EditorType;
  status: TemplateStatus;
  currentVersionId?: string | null;
  currentVersion?: CurrentVersionSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplatePayload {
  name: string;
  slug?: string;
  description?: string;
  subject: string;
  editorType: EditorType;
}

export interface UpdateTemplatePayload {
  name?: string;
  slug?: string;
  description?: string;
  subject?: string;
  status?: TemplateStatus;
}

export interface TemplateVersionSummary {
  id: string;
  templateId: string;
  version: number;
  variables: TemplateVariable[] | string[];
  createdBy: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface TemplateVersionDetail extends TemplateVersionSummary {
  html: string;
  builderContent?: Record<string, unknown> | null;
}

export interface CreateTemplateVersionPayload {
  html: string;
  builderContent?: Record<string, unknown>;
}

export interface TemplateQuery {
  page?: number;
  limit?: number;
  status?: TemplateStatus;
  editorType?: EditorType;
  search?: string;
}
