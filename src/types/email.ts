export type EmailStatus = 'QUEUED' | 'PROCESSING' | 'SENT' | 'FAILED';

export type EmailEventType =
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'BOUNCED'
  | 'OPENED'
  | 'FAILED';

export interface EmailTrackingStats {
  opened: boolean;
  openCount: number;
  firstOpenedAt?: string | null;
  lastOpenedAt?: string | null;
  deliveredAt?: string | null;
  bouncedAt?: string | null;
}

export interface EmailEventDetail {
  event: EmailEventType | string;
  timestamp: string;
  details?: {
    url?: string;
    reason?: string;
    error?: string;
    messageId?: string;
    [key: string]: unknown;
  };
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
  tracking?: EmailTrackingStats;
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
