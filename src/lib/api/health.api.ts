import { request } from './client';
import { HealthStatus } from '@/types';

export async function getHealthApi(): Promise<HealthStatus> {
  return request<HealthStatus>('/health', {
    method: 'GET',
    skipOrgHeader: true,
  });
}
