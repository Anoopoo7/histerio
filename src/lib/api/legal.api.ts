import { request } from './client';
import { LegalConsentRecord, LegalDocumentType, PolicyMetadata } from '@/types/legal';

export interface CreateConsentPayload {
  documentType: string;
  documentVersion: string;
  scope?: 'REGISTRATION' | 'ORG_CREATION' | 'DASHBOARD_GATE';
  orgId?: string;
}

interface BackendLegalConsentDto {
  id: string;
  userId: string;
  orgId?: string | null;
  policyType: string;
  version: string;
  scope?: string;
  acceptedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

function docTypeToPolicyType(type: string): string {
  const normalized = type.toLowerCase().replace(/-/g, '_');
  if (normalized === 'cookie') return 'COOKIE';
  return normalized.toUpperCase();
}

function policyTypeToDocType(policyType: string): LegalDocumentType {
  const normalized = policyType.toLowerCase();
  if (normalized === 'acceptable_use') return 'acceptable-use';
  if (normalized === 'anti_spam') return 'anti-spam';
  return normalized as LegalDocumentType;
}

export async function getPoliciesApi(): Promise<PolicyMetadata[]> {
  try {
    return await request<PolicyMetadata[]>('/v1/legal/policies', {
      method: 'GET',
      skipOrgHeader: true,
      skipAuthToken: true,
    });
  } catch {
    // Fallback to local configuration if backend legal endpoints are unreachable
    const { getAllPolicyMetadata } = await import('@/lib/legal');
    return getAllPolicyMetadata();
  }
}

export async function getUserConsentsApi(): Promise<LegalConsentRecord[]> {
  try {
    const rawConsents = await request<BackendLegalConsentDto[]>('/v1/users/me/consents', {
      method: 'GET',
      skipOrgHeader: true,
    });

    return rawConsents.map((item) => ({
      id: item.id,
      userId: item.userId,
      orgId: item.orgId || undefined,
      documentType: policyTypeToDocType(item.policyType),
      documentVersion: item.version,
      acceptedAt: item.acceptedAt,
      ipAddress: item.ipAddress || undefined,
      userAgent: item.userAgent || undefined,
    }));
  } catch {
    return [];
  }
}

export async function recordConsentApi(
  payload: CreateConsentPayload,
): Promise<LegalConsentRecord> {
  const policyType = docTypeToPolicyType(payload.documentType);
  const scope = payload.scope || (payload.orgId ? 'ORG_CREATION' : 'DASHBOARD_GATE');

  try {
    const rawResponse = await request<BackendLegalConsentDto[]>('/v1/users/me/consents', {
      method: 'POST',
      body: JSON.stringify({
        consents: [
          {
            policyType,
            version: payload.documentVersion,
            scope,
          },
        ],
        orgId: payload.orgId,
      }),
      skipOrgHeader: !payload.orgId,
    });

    const recorded = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : null;

    if (recorded) {
      return {
        id: recorded.id,
        userId: recorded.userId,
        orgId: recorded.orgId || undefined,
        documentType: policyTypeToDocType(recorded.policyType),
        documentVersion: recorded.version,
        acceptedAt: recorded.acceptedAt,
        ipAddress: recorded.ipAddress || undefined,
        userAgent: recorded.userAgent || undefined,
      };
    }
  } catch (err) {
    console.warn('Backend consent recording fallback:', err);
  }

  // Client-side recorded fallback state
  return {
    id: `local_consent_${Date.now()}`,
    userId: 'current_user',
    orgId: payload.orgId,
    documentType: payload.documentType as LegalDocumentType,
    documentVersion: payload.documentVersion,
    acceptedAt: new Date().toISOString(),
  };
}
