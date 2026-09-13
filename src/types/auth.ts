export type AuthProviderType = 'password' | 'google';

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  authProviders?: AuthProviderType[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface GoogleAuthPayload {
  credential: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  acceptedTermsVersion?: string;
  acceptedPrivacyVersion?: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface GenericMessageResponse {
  message: string;
}
