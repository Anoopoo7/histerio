export type EmailStatus = 'QUEUED' | 'PROCESSING' | 'SENT' | 'FAILED';

export interface EmailEventDetail {
  event: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface EmailSummary {
  id: string;
  templateId: string;
  templateVersionId: string;
  to: string[];
  subject: string;
  status: EmailStatus;
  attempts: number;
  providerMessageId?: string | null;
  error?: Record<string, unknown> | string | null;
  queuedAt: string;
  sentAt?: string | null;
}

export interface EmailDetail extends EmailSummary {
  cc: string[];
  bcc: string[];
  html: string;
  events: EmailEventDetail[];
}

export interface EmailQuery {
  page?: number;
  limit?: number;
  status?: EmailStatus;
  templateId?: string;
  recipient?: string;
}
