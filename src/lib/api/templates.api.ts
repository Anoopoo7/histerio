import { request } from './client';
import {
  CreateTemplatePayload,
  CreateTemplateVersionPayload,
  PaginatedResponse,
  Template,
  TemplateQuery,
  TemplateVersionDetail,
  TemplateVersionSummary,
  UpdateTemplatePayload,
} from '@/types';

export async function getTemplatesApi(query?: TemplateQuery): Promise<PaginatedResponse<Template>> {
  return request<PaginatedResponse<Template>>('/templates', {
    method: 'GET',
    params: query as Record<string, string | number | boolean | undefined | null>,
  });
}

export async function getTemplateByIdApi(id: string): Promise<Template> {
  return request<Template>(`/templates/${id}`, {
    method: 'GET',
  });
}

export async function createTemplateApi(payload: CreateTemplatePayload): Promise<Template> {
  return request<Template>('/templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTemplateApi(id: string, payload: UpdateTemplatePayload): Promise<Template> {
  return request<Template>(`/templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function archiveTemplateApi(id: string): Promise<Template> {
  return request<Template>(`/templates/${id}`, {
    method: 'DELETE',
  });
}

export async function activateTemplateApi(id: string): Promise<Template> {
  return request<Template>(`/templates/${id}/activate`, {
    method: 'POST',
  });
}

export async function createTemplateVersionApi(
  id: string,
  payload: CreateTemplateVersionPayload
): Promise<TemplateVersionDetail> {
  return request<TemplateVersionDetail>(`/templates/${id}/versions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getTemplateVersionsApi(id: string): Promise<TemplateVersionSummary[]> {
  return request<TemplateVersionSummary[]>(`/templates/${id}/versions`, {
    method: 'GET',
  });
}

export async function getTemplateVersionByNumberApi(
  id: string,
  version: number
): Promise<TemplateVersionDetail> {
  return request<TemplateVersionDetail>(`/templates/${id}/versions/${version}`, {
    method: 'GET',
  });
}

export async function setTemplateCurrentVersionApi(id: string, version: number): Promise<Template> {
  return request<Template>(`/templates/${id}/versions/${version}/set-current`, {
    method: 'POST',
  });
}
