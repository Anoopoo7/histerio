import { request } from './client';
import { AuthResponse, LoginPayload, RegisterPayload } from '@/types';

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
  });
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
  });
}
