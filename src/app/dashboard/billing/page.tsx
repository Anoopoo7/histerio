'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Clock,
  Send,
  FileCode,
  Users,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useOrganization } from '@/hooks/useOrganization';
import {
  getBillingSubscription,
  getBillingUsage,
  getBillingPayments,
  getBillingPlans,
  createBillingCheckout,
  confirmBillingPayment,
  cancelBillingSubscription,
  reactivateBillingSubscription,
  ApiError,
} from '@/lib/api';
import {
  SubscriptionResponseDto,
  UsageResponseDto,
  PaymentResponseDto,
  PlanResponseDto,
  SubscriptionStatus,
  PaymentStatus,
  PlanCode,
} from '@/types';
import { formatDate } from '@/lib/utils/format';
import { openRazorpayCheckout } from '@/lib/utils/razorpay';
import {
  Button,
  Badge,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  LoadingSpinner,
  Modal,
  EmptyState,
} from '@/components/ui';

export default function DashboardBillingPage() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const { addToast } = useToast();

  const [subscription, setSubscription] = useState<SubscriptionResponseDto | null>(null);
  const [usage, setUsage] = useState<UsageResponseDto | null>(null);
  const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
  const [plans, setPlans] = useState<PlanResponseDto[]>([]);

  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsLimit] = useState(10);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [checkoutPlanCode, setCheckoutPlanCode] = useState<PlanCode | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponseDto | null>(null);

  const fetchBillingData = useCallback(async () => {
    if (!currentOrg) return;

    try {
      const [subRes, usageRes, paymentsRes, plansRes] = await Promise.allSettled([
        getBillingSubscription(),
        getBillingUsage(),
        getBillingPayments({ page: paymentsPage, limit: paymentsLimit }),
        getBillingPlans(),
      ]);

      if (subRes.status === 'fulfilled') setSubscription(subRes.value);
      if (usageRes.status === 'fulfilled') setUsage(usageRes.value);
      if (paymentsRes.status === 'fulfilled') {
        setPayments(paymentsRes.value.items);
        setPaymentsTotal(paymentsRes.value.total);
        setPaymentsTotalPages(paymentsRes.value.totalPages);
      }
      if (plansRes.status === 'fulfilled') {
        setPlans(plansRes.value);
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error Loading Billing',
        message: 'Failed to load billing and subscription data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg, paymentsPage, paymentsLimit, addToast]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!currentOrg || ignore) return;
      await fetchBillingData();
    };
    run();
    return () => {
      ignore = true;
    };
  }, [currentOrg, fetchBillingData]);

  const handleCheckout = async (planCode: PlanCode) => {
    setCheckoutPlanCode(planCode);

    try {
      const checkoutSession = await createBillingCheckout(planCode);

      await openRazorpayCheckout({
        keyId: checkoutSession.razorpayKeyId,
        subscriptionId: checkoutSession.subscriptionId,
        planName: planCode,
        userName: user?.name,
        userEmail: user?.email,
        onSuccess: async (rzpRes) => {
          try {
            const confirmedSub = await confirmBillingPayment({
              razorpaySubscriptionId: rzpRes.razorpay_subscription_id,
              razorpayPaymentId: rzpRes.razorpay_payment_id,
              razorpaySignature: rzpRes.razorpay_signature,
              razorpayOrderId: rzpRes.razorpay_order_id,
            });

            addToast({
              type: 'success',
              title: 'Payment Successful',
              message: `Your ${planCode} plan is now active!`,
            });

            setSubscription(confirmedSub);
            fetchBillingData();
          } catch (err) {
            if (err instanceof ApiError) {
              addToast({
                type: 'error',
                title: 'Payment Verification Failed',
                message: err.message,
              });
            } else {
              addToast({
                type: 'error',
                title: 'Verification Failed',
                message: 'Failed to confirm payment signature with server.',
              });
            }
          } finally {
            setCheckoutPlanCode(null);
          }
        },
        onDismiss: () => {
          setCheckoutPlanCode(null);
          addToast({
            type: 'info',
            title: 'Checkout Cancelled',
            message: 'Payment window closed. No changes were made.',
          });
        },
        onError: (errMessage) => {
          setCheckoutPlanCode(null);
          addToast({
            type: 'error',
            title: 'Checkout Error',
            message: errMessage,
          });
        },
      });
    } catch (err) {
      setCheckoutPlanCode(null);
      if (err instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Checkout Failed',
          message: err.message,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Checkout Error',
          message: 'Unable to initiate payment session.',
        });
      }
    }
  };

  const handleCancelSubscription = async () => {
    setIsActionLoading(true);
    try {
      const updatedSub = await cancelBillingSubscription();
      setSubscription(updatedSub);
      setIsCancelModalOpen(false);
      addToast({
        type: 'info',
        title: 'Subscription Cancelled',
        message: 'Your cancellation is scheduled for the end of the current billing period.',
      });
      fetchBillingData();
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Cancellation Failed',
          message: err.message,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Cancellation Failed',
          message: 'Failed to schedule subscription cancellation.',
        });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsActionLoading(true);
    try {
      const updatedSub = await reactivateBillingSubscription();
      setSubscription(updatedSub);
      addToast({
        type: 'success',
        title: 'Subscription Reactivated',
        message: 'Your subscription cancellation has been revoked.',
      });
      fetchBillingData();
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Reactivation Failed',
          message: err.message,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Reactivation Failed',
          message: 'Failed to reactivate subscription.',
        });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status?: SubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'TRIALING':
        return <Badge variant="purple">Trial</Badge>;
      case 'PAST_DUE':
        return <Badge variant="warning">Payment Issue</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">Cancelled</Badge>;
      case 'EXPIRED':
        return <Badge variant="error">Expired</Badge>;
      case 'SUSPENDED':
        return <Badge variant="error">Suspended</Badge>;
      default:
        return <Badge variant="neutral">Active</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'CAPTURED':
        return <Badge variant="success" size="sm">Paid</Badge>;
      case 'AUTHORIZED':
        return <Badge variant="info" size="sm">Authorized</Badge>;
      case 'CREATED':
        return <Badge variant="warning" size="sm">Created</Badge>;
      case 'FAILED':
        return <Badge variant="error" size="sm">Failed</Badge>;
      case 'REFUNDED':
        return <Badge variant="purple" size="sm">Refunded</Badge>;
      case 'PARTIALLY_REFUNDED':
        return <Badge variant="purple" size="sm">Partially Refunded</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency.toUpperCase() === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading billing and usage details..." />;
  }

  const currentPlan = subscription?.plan || plans.find((p) => p.code === (subscription?.planCode || 'FREE'));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Billing & Quota Management</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage plan subscription, email dispatch limits, and payment history for <span className="font-semibold text-zinc-200">{currentOrg?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Compare All Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Subscription Scheduled Cancellation Alert */}
      {subscription?.cancelAtPeriodEnd && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Cancellation scheduled. Your active subscription access will end on{' '}
              <strong className="text-amber-200">{formatDate(subscription.currentPeriodEnd)}</strong>.
            </span>
          </div>
          <Button
            onClick={handleReactivateSubscription}
            isLoading={isActionLoading}
            size="sm"
            variant="secondary"
            className="whitespace-nowrap"
          >
            Reactivate Subscription
          </Button>
        </div>
      )}

      {/* 2. Inactive Subscription / CanSend Disabled Alert */}
      {subscription && !subscription.canSend && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Email sending is currently disabled for this organization. Upgrade or reactivate your subscription to resume dispatch.
            </span>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="whitespace-nowrap">
              Upgrade Subscription
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Current Plan Card & Quick Upgrades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Current Plan Box */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Subscription</span>
              {getStatusBadge(subscription?.status)}
            </div>

            <div className="flex items-baseline justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-100">{currentPlan?.name || subscription?.planCode || 'FREE Plan'}</h2>
                <p className="text-xs text-zinc-400 mt-1">{currentPlan?.description || 'Basic transactional email access'}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-zinc-100">
                  {currentPlan ? formatCurrency(currentPlan.price, currentPlan.currency) : 'Free'}
                </span>
                <span className="text-xs text-zinc-500 block">/{currentPlan?.billingInterval || 'month'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <span className="text-zinc-500 block">Billing Period</span>
                <span className="text-zinc-200 font-mono text-[11px]">
                  {formatDate(subscription?.currentPeriodStart)} – {formatDate(subscription?.currentPeriodEnd)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Email Sending</span>
                <span className={`font-semibold ${subscription?.canSend !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {subscription?.canSend !== false ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Auto-Renew</span>
                <span className="text-zinc-200 font-medium">
                  {subscription?.cancelAtPeriodEnd ? 'Disabled' : 'Enabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800">
            {subscription?.planCode !== 'BUSINESS' && (
              <Link href="/pricing">
                <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Upgrade Plan
                </Button>
              </Link>
            )}

            {subscription?.planCode !== 'FREE' && (
              <>
                {subscription?.cancelAtPeriodEnd ? (
                  <Button
                    onClick={handleReactivateSubscription}
                    isLoading={isActionLoading}
                    variant="secondary"
                    size="sm"
                  >
                    Reactivate Subscription
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsCancelModalOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Quick Upgrade Cards Box */}
        <Card className="p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Available Plan Upgrades</h3>
            <div className="space-y-3">
              {plans
                .filter((p) => p.code !== 'FREE')
                .map((plan) => {
                  const isCurrent = subscription?.planCode === plan.code;
                  const isCheckingOut = checkoutPlanCode === plan.code;

                  return (
                    <div
                      key={plan.id}
                      className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-zinc-200 block">{plan.name}</span>
                        <span className="text-[11px] text-zinc-400">
                          {formatCurrency(plan.price, plan.currency)} / mo • {plan.monthlyEmailLimit.toLocaleString()} emails
                        </span>
                      </div>
                      <Button
                        onClick={() => handleCheckout(plan.code)}
                        isLoading={isCheckingOut}
                        disabled={isCurrent || (Boolean(checkoutPlanCode) && !isCheckingOut)}
                        size="sm"
                        variant={isCurrent ? 'ghost' : 'outline'}
                      >
                        {isCurrent ? 'Active' : 'Upgrade'}
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Quotas & Usage Stats */}
      {usage && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Quota & Usage Entitlements</h3>
              <p className="text-xs text-zinc-400">Current period consumption against plan quotas</p>
            </div>
            <Badge variant="purple" size="sm">
              {usage.usagePercent}% Email Quota Used
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email Quota */}
            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                  <Send className="w-3.5 h-3.5 text-indigo-400" /> Emails Sent
                </span>
                <span className="font-mono text-zinc-200 font-bold">
                  {usage.emailsUsed.toLocaleString()} / {usage.emailLimit.toLocaleString()}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    usage.usagePercent >= 90
                      ? 'bg-rose-500'
                      : usage.usagePercent >= 70
                      ? 'bg-amber-400'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, usage.usagePercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span>Remaining: {usage.emailsRemaining.toLocaleString()}</span>
                <span>{usage.usagePercent}% used</span>
              </div>
            </div>

            {/* Template Quota */}
            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" /> Templates
                </span>
                <span className="font-mono text-zinc-200 font-bold">
                  {usage.templateCount.toLocaleString()} / {usage.templateLimit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((usage.templateCount / Math.max(1, usage.templateLimit)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span>Designs created</span>
                <span>
                  {Math.round((usage.templateCount / Math.max(1, usage.templateLimit)) * 100)}% used
                </span>
              </div>
            </div>

            {/* Member Quota */}
            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> Organization Members
                </span>
                <span className="font-mono text-zinc-200 font-bold">
                  {usage.memberCount.toLocaleString()} / {usage.memberLimit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((usage.memberCount / Math.max(1, usage.memberLimit)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span>Team members</span>
                <span>
                  {Math.round((usage.memberCount / Math.max(1, usage.memberLimit)) * 100)}% capacity
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 5. Payment History Table */}
      <Card>
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Payment & Transaction History</h3>
            <p className="text-xs text-zinc-400">Invoices and Razorpay payment records</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-10 h-10 text-zinc-500" />}
            title="No payment history yet"
            description="Payment records will appear here when subscription invoices are processed."
          />
        ) : (
          <div className="bg-zinc-900 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Invoice ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <TableCell className="text-xs text-zinc-300 font-mono">
                      {formatDate(payment.paidAt || payment.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-zinc-200">
                      {payment.planCodeSnapshot || 'PRO'}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold text-zinc-100">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-xs font-mono text-zinc-400">
                      {payment.razorpayPaymentId}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-zinc-400">
                      {payment.razorpayInvoiceId || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-4 border-t border-zinc-800">
              <Pagination
                page={paymentsPage}
                totalPages={paymentsTotalPages}
                total={paymentsTotal}
                limit={paymentsLimit}
                onPageChange={(p) => setPaymentsPage(p)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Cancel Subscription Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Subscription?"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Are you sure you want to cancel your paid subscription?
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            Your subscription will remain active until the end of your current billing period ({formatDate(subscription?.currentPeriodEnd)}). After that, plan limits will revert to FREE.
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              isLoading={isActionLoading}
              onClick={handleCancelSubscription}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Detail Modal */}
      <Modal
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        title="Payment Transaction Details"
      >
        {selectedPayment && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono">
              <div>
                <span className="text-zinc-500 block">Amount</span>
                <span className="text-zinc-100 font-bold">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Status</span>
                <span>{getPaymentStatusBadge(selectedPayment.status)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Payment ID</span>
                <span className="text-zinc-300 break-all">{selectedPayment.razorpayPaymentId}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Invoice ID</span>
                <span className="text-zinc-300 break-all">{selectedPayment.razorpayInvoiceId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Plan</span>
                <span className="text-indigo-400 font-semibold">{selectedPayment.planCodeSnapshot || 'PRO'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Date</span>
                <span className="text-zinc-300">{formatDate(selectedPayment.paidAt || selectedPayment.createdAt)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
