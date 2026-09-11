import { request } from './client';
import { EmailDetail, EmailQuery, EmailSummary, PaginatedResponse } from '@/types';

export async function getEmailsApi(query?: EmailQuery): Promise<PaginatedResponse<EmailSummary>> {
  return request<PaginatedResponse<EmailSummary>>('/emails', {
    method: 'GET',
    params: query as Record<string, string | number | boolean | undefined | null>,
  });
}

export async function getEmailByIdApi(id: string): Promise<EmailDetail> {
  return request<EmailDetail>(`/emails/${id}`, {
    method: 'GET',
  });
}
