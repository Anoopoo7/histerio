import { request } from './client';
import { ApiKey, ApiKeyCreated, CreateApiKeyPayload } from '@/types';

export async function getApiKeysApi(): Promise<ApiKey[]> {
  return request<ApiKey[]>('/api-keys', {
    method: 'GET',
  });
}

export async function createApiKeyApi(payload: CreateApiKeyPayload): Promise<ApiKeyCreated> {
  return request<ApiKeyCreated>('/api-keys', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function revokeApiKeyApi(id: string): Promise<ApiKey> {
  return request<ApiKey>(`/api-keys/${id}/revoke`, {
    method: 'POST',
  });
}

export async function deleteApiKeyApi(id: string): Promise<ApiKey> {
  return request<ApiKey>(`/api-keys/${id}`, {
    method: 'DELETE',
  });
}
