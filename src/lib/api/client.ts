import { ApiErrorResponse } from '@/types';

export class ApiError extends Error {
  statusCode: number;
  messages: string[];
  code?: string;
  errorResponse?: ApiErrorResponse;

  constructor(statusCode: number, message: string | string[], errorResponse?: ApiErrorResponse) {
    const messageString = Array.isArray(message) ? message.join(', ') : message;
    super(messageString);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.messages = Array.isArray(message) ? message : [message];
    this.code = errorResponse?.code;
    this.errorResponse = errorResponse;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
const TOKEN_KEY = 'histeria_jwt_token';
const ORG_KEY = 'histeria_selected_org_id';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredOrgId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ORG_KEY);
}

export function setStoredOrgId(orgId: string | null): void {
  if (typeof window === 'undefined') return;
  if (orgId) {
    localStorage.setItem(ORG_KEY, orgId);
  } else {
    localStorage.removeItem(ORG_KEY);
  }
}

let onUnauthorizedCallback: (() => void) | null = null;

export function registerUnauthorizedHandler(cb: () => void): void {
  onUnauthorizedCallback = cb;
}

interface FetchOptions extends RequestInit {
  orgId?: string;
  skipOrgHeader?: boolean;
  skipAuthToken?: boolean;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { orgId, skipOrgHeader = false, skipAuthToken = false, params, headers: customHeaders, ...restOptions } = options;

  let url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuthToken) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (!skipOrgHeader) {
    const targetOrgId = orgId || getStoredOrgId();
    if (targetOrgId) {
      headers['x-organization-id'] = targetOrgId;
    }
  }

  const method = (restOptions.method || 'GET').toUpperCase();
  const requestBody = restOptions.body ?? (['POST', 'PUT', 'PATCH'].includes(method) ? '{}' : undefined);

  const response = await fetch(url, {
    ...restOptions,
    body: requestBody,
    headers,
  });

  if (response.status === 401) {
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null;
    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      // JSON parsing failed
    }

    const message = errorData?.message || response.statusText || 'An unexpected API error occurred';
    throw new ApiError(response.status, message, errorData || undefined);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
