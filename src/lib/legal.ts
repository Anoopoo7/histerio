import companyConfig from '../../content/legal/company.json';
import policiesConfig from '../../content/legal/policies.json';
import termsDoc from '../../content/legal/terms.json';
import privacyDoc from '../../content/legal/privacy.json';
import acceptableUseDoc from '../../content/legal/acceptable-use.json';
import antiSpamDoc from '../../content/legal/anti-spam.json';
import cookieDoc from '../../content/legal/cookie.json';
import dpaDoc from '../../content/legal/dpa.json';
import subprocessorsDoc from '../../content/legal/subprocessors.json';
import refundsDoc from '../../content/legal/refunds.json';
import securityDoc from '../../content/legal/security.json';
import slaDoc from '../../content/legal/sla.json';

import {
  CompanyLegalConfig,
  LegalDocumentContent,
  LegalDocumentType,
  PolicyMetadata,
} from '@/types/legal';

const documentsMap: Record<LegalDocumentType, LegalDocumentContent> = {
  terms: termsDoc as unknown as LegalDocumentContent,
  privacy: privacyDoc as unknown as LegalDocumentContent,
  'acceptable-use': acceptableUseDoc as unknown as LegalDocumentContent,
  'anti-spam': antiSpamDoc as unknown as LegalDocumentContent,
  cookie: cookieDoc as unknown as LegalDocumentContent,
  dpa: dpaDoc as unknown as LegalDocumentContent,
  subprocessors: subprocessorsDoc as unknown as LegalDocumentContent,
  refunds: refundsDoc as unknown as LegalDocumentContent,
  security: securityDoc as unknown as LegalDocumentContent,
  sla: slaDoc as unknown as LegalDocumentContent,
};

export function getCompanyLegalConfig(): CompanyLegalConfig {
  return companyConfig as CompanyLegalConfig;
}

export function getAllPolicyMetadata(): PolicyMetadata[] {
  return policiesConfig.policies as PolicyMetadata[];
}

export function getLegalDocument(documentType: LegalDocumentType): LegalDocumentContent | null {
  return documentsMap[documentType] || null;
}

export function getRequiredRegistrationPolicies(): PolicyMetadata[] {
  return getAllPolicyMetadata().filter((p) => p.isRequiredForRegistration);
}

export function getRequiredOrganizationPolicies(): PolicyMetadata[] {
  return getAllPolicyMetadata().filter((p) => p.isRequiredForOrganization);
}

export function checkLegalPlaceholders(): string[] {
  const company = getCompanyLegalConfig();
  const placeholders: string[] = [];

  Object.entries(company).forEach(([key, val]) => {
    if (typeof val === 'string' && (val.includes('[') || val.includes(']'))) {
      placeholders.push(`Company configuration '${key}' contains unreplaced placeholder: ${val}`);
    }
  });

  return placeholders;
}
