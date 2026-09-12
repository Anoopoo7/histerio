export type PlanCode = 'FREE' | 'PRO' | 'BUSINESS';

export type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'SUSPENDED';

export type PaymentStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface PlanResponseDto {
  id: string;
  code: PlanCode;
  name: string;
  description: string;
  monthlyEmailLimit: number;
  templateLimit: number;
  memberLimit: number;
  price: number;
  currency: string;
  billingInterval: string;
  isActive: boolean;
}

export interface SubscriptionResponseDto {
  id: string;
  planCode: PlanCode;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string | null;
  canSend: boolean;
  plan?: PlanResponseDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsageResponseDto {
  periodStart: string;
  periodEnd: string;
  emailsUsed: number;
  emailLimit: number;
  emailsRemaining: number;
  usagePercent: number;
  templateCount: number;
  templateLimit: number;
  memberCount: number;
  memberLimit: number;
}

export interface PaymentResponseDto {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string | null;
  planCodeSnapshot?: string | null;
  razorpayPaymentId: string;
  razorpayInvoiceId?: string | null;
  createdAt: string;
}

export interface CheckoutResponseDto {
  subscriptionId: string;
  razorpayKeyId: string;
  planCode: PlanCode;
}

export interface ConfirmPaymentDto {
  razorpaySubscriptionId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  razorpayOrderId?: string;
}

export interface PaymentQueryDto {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}
