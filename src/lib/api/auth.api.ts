import { request } from './client';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  GenericMessageResponse,
  GoogleAuthPayload,
} from '@/types';

export async function registerApi(payload: RegisterPayload): Promise<GenericMessageResponse> {
  return request<GenericMessageResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
    skipAuthToken: true,
  });
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
    skipAuthToken: true,
  });
}

export async function loginWithGoogleApi(payload: GoogleAuthPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
    skipAuthToken: true,
  });
}

export async function linkGoogleAccountApi(payload: GoogleAuthPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/google/link', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function unlinkGoogleAccountApi(): Promise<GenericMessageResponse> {
  return request<GenericMessageResponse>('/auth/google/link', {
    method: 'DELETE',
  });
}

export async function verifyEmailApi(payload: VerifyEmailPayload): Promise<GenericMessageResponse> {
  return request<GenericMessageResponse>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
    skipAuthToken: true,
  });
}

export async function resendVerificationApi(
  payload: ResendVerificationPayload,
): Promise<GenericMessageResponse> {
  return request<GenericMessageResponse>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
    skipAuthToken: true,
  });
}

export async function forgotPasswordApi(
  payload: ForgotPasswordPayload,
): Promise<GenericMessageResponse> {
  return request<GenericMessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
    skipAuthToken: true,
  });
}

export async function resetPasswordApi(
  payload: ResetPasswordPayload,
): Promise<GenericMessageResponse> {
  return request<GenericMessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipOrgHeader: true,
    skipAuthToken: true,
  });
}
