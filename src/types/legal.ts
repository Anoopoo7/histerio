export type LegalDocumentType =
  | 'terms'
  | 'privacy'
  | 'acceptable-use'
  | 'anti-spam'
  | 'cookie'
  | 'dpa'
  | 'subprocessors'
  | 'refunds'
  | 'security'
  | 'sla';

export interface CompanyLegalConfig {
  legalName: string;
  brandName: string;
  website: string;
  legalEmail: string;
  privacyEmail: string;
  supportEmail: string;
  address: string;
  country: string;
  effectiveDate: string;
  lastUpdated: string;
}

export interface PolicyMetadata {
  documentType: LegalDocumentType;
  title: string;
  shortSummary: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  isRequiredForRegistration: boolean;
  isRequiredForOrganization: boolean;
  status: 'published' | 'draft';
}

export interface LegalDocumentContent extends PolicyMetadata {
  sections: Array<{
    id: string;
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
}

export interface LegalConsentRecord {
  id: string;
  userId: string;
  orgId?: string;
  documentType: LegalDocumentType;
  documentVersion: string;
  acceptedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SubprocessorEntry {
  name: string;
  purpose: string;
  dataTypes: string[];
  location: string;
  website: string;
}
