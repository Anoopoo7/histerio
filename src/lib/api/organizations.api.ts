import { request } from './client';
import { CreateOrganizationPayload, Organization } from '@/types';

export async function getOrganizationsApi(): Promise<Organization[]> {
  return request<Organization[]>('/organizations', {
    method: 'GET',
    skipOrgHeader: true,
  });
}

export async function getOrganizationByIdApi(id: string): Promise<Organization> {
  return request<Organization>(`/organizations/${id}`, {
    method: 'GET',
    orgId: id,
  });
}

export async function createOrganizationApi(payload: CreateOrganizationPayload): Promise<Organization> {
  return request<Organization>('/organizations', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
  });
}
