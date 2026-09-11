import { request } from './client';
import { SmtpConfig, TestSmtpPayload, TestSmtpResult, UpsertSmtpPayload } from '@/types';

export async function getSmtpApi(): Promise<SmtpConfig> {
  return request<SmtpConfig>('/smtp', {
    method: 'GET',
  });
}

export async function upsertSmtpApi(payload: UpsertSmtpPayload): Promise<SmtpConfig> {
  return request<SmtpConfig>('/smtp', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function testSmtpApi(payload: TestSmtpPayload): Promise<TestSmtpResult> {
  return request<TestSmtpResult>('/smtp/test', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
