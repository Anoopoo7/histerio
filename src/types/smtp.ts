export interface SmtpConfig {
  id: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isConfigured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSmtpPayload {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
}

export interface TestSmtpPayload {
  to: string;
}

export interface TestSmtpResult {
  success: boolean;
  message: string;
}
