import { request } from './client';
import {
  CheckoutResponseDto,
  ConfirmPaymentDto,
  PaginatedResponse,
  PaymentQueryDto,
  PaymentResponseDto,
  PlanCode,
  PlanResponseDto,
  SubscriptionResponseDto,
  UsageResponseDto,
} from '@/types';

export async function getBillingPlans(): Promise<PlanResponseDto[]> {
  return request<PlanResponseDto[]>('/v1/billing/plans', {
    method: 'GET',
    skipOrgHeader: true,
    skipAuthToken: true,
  });
}

export async function getBillingSubscription(): Promise<SubscriptionResponseDto> {
  return request<SubscriptionResponseDto>('/v1/billing/subscription', {
    method: 'GET',
  });
}

export async function getBillingUsage(): Promise<UsageResponseDto> {
  return request<UsageResponseDto>('/v1/billing/usage', {
    method: 'GET',
  });
}

export async function getBillingPayments(
  params?: PaymentQueryDto
): Promise<PaginatedResponse<PaymentResponseDto>> {
  return request<PaginatedResponse<PaymentResponseDto>>('/v1/billing/payments', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
}

export async function createBillingCheckout(
  planCode: PlanCode
): Promise<CheckoutResponseDto> {
  return request<CheckoutResponseDto>('/v1/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ planCode }),
  });
}

export async function confirmBillingPayment(
  payload: ConfirmPaymentDto
): Promise<SubscriptionResponseDto> {
  return request<SubscriptionResponseDto>('/v1/billing/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function cancelBillingSubscription(): Promise<SubscriptionResponseDto> {
  return request<SubscriptionResponseDto>('/v1/billing/cancel', {
    method: 'POST',
  });
}

export async function reactivateBillingSubscription(): Promise<SubscriptionResponseDto> {
  return request<SubscriptionResponseDto>('/v1/billing/reactivate', {
    method: 'POST',
  });
}
