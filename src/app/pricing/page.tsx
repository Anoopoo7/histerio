'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Check, ArrowRight, ShieldCheck, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useOrganization } from '@/hooks/useOrganization';
import {
  getBillingPlans,
  getBillingSubscription,
  createBillingCheckout,
  confirmBillingPayment,
  ApiError,
} from '@/lib/api';
import { PlanResponseDto, SubscriptionResponseDto, PlanCode } from '@/types';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui';
import { openRazorpayCheckout } from '@/lib/utils/razorpay';

export default function PublicPricingPage() {
  const { isAuthenticated, user } = useAuth();
  const { currentOrg } = useOrganization();
  const { addToast } = useToast();
  const router = useRouter();

  const [plans, setPlans] = useState<PlanResponseDto[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutPlanCode, setCheckoutPlanCode] = useState<PlanCode | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const fetchedPlans = await getBillingPlans();
        if (ignore) return;
        // Sort plans order FREE -> PRO -> BUSINESS
        const sortedPlans = [...fetchedPlans].sort((a, b) => a.price - b.price);
        setPlans(sortedPlans);

        if (isAuthenticated && currentOrg) {
          try {
            const sub = await getBillingSubscription();
            if (!ignore) setSubscription(sub);
          } catch {
            // Subscription fetch error non-blocking
          }
        }
      } catch {
        if (!ignore) {
          addToast({
            type: 'error',
            title: 'Error Loading Plans',
            message: 'Unable to fetch billing plans. Please check backend connection.',
          });
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, currentOrg, addToast]);

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    if (currency.toUpperCase() === 'INR') {
      return `₹${price.toLocaleString('en-IN')}`;
    }
    return `$${price.toLocaleString('en-US')}`;
  };

  const handleSelectPlan = async (plan: PlanResponseDto) => {
    if (!isAuthenticated) {
      router.push('/register');
      return;
    }

    if (plan.code === 'FREE') {
      router.push('/dashboard/billing');
      return;
    }

    if (!currentOrg) {
      addToast({
        type: 'info',
        title: 'Organization Required',
        message: 'Please select or create an organization first.',
      });
      router.push('/dashboard');
      return;
    }

    setCheckoutPlanCode(plan.code);

    try {
      const checkoutSession = await createBillingCheckout(plan.code);

      await openRazorpayCheckout({
        keyId: checkoutSession.razorpayKeyId,
        subscriptionId: checkoutSession.subscriptionId,
        planName: plan.name,
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

            if (confirmedSub.status === 'ACTIVE') {
              addToast({
                type: 'success',
                title: 'Payment Successful',
                message: `Your ${plan.name} subscription is now active!`,
              });
            } else {
              addToast({
                type: 'info',
                title: 'Payment Received',
                message: 'Payment received. Confirming subscription status...',
              });
            }

            setSubscription(confirmedSub);
            router.push('/dashboard/billing');
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
                message: 'Payment completed but confirmation failed. Please contact support.',
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
            title: 'Payment Cancelled',
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
          message: 'Unable to start checkout. Please try again.',
        });
      }
    }
  };

  const currentPlanCode = subscription?.planCode || 'FREE';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <header className="h-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <span className="font-bold text-xl text-zinc-100 tracking-tight">Histeria</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button leftIcon={<LayoutDashboard className="w-4 h-4" />}>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs font-semibold text-zinc-300 hover:text-zinc-100 px-3 py-2">
                Sign In
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Simple, Transparent SaaS Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 leading-tight">
            Flexible plans for teams of any scale
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Dispatch transactional emails with automated template rendering, delivery tracking, and API keys. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        {isLoading ? (
          <div className="py-20">
            <LoadingSpinner label="Fetching available subscription plans..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            {plans.map((plan) => {
              const isCurrent = isAuthenticated && currentPlanCode === plan.code;
              const isRecommended = plan.code === 'PRO';
              const isCheckingOutThis = checkoutPlanCode === plan.code;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col justify-between p-8 transition-all duration-200 ${
                    isRecommended
                      ? 'border-indigo-500/60 bg-zinc-900/90 shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                      : 'border-zinc-800/90 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-[10px] uppercase tracking-widest rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-zinc-100">{plan.name}</h2>
                        {isCurrent && (
                          <Badge variant="purple" size="sm" dot={false}>
                            Current Plan
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-2 min-h-[36px] leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price Display */}
                    <div className="border-y border-zinc-800/80 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-zinc-100 tracking-tight">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-xs text-zinc-400 font-medium">/{plan.billingInterval || 'month'}</span>
                        )}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 pt-2 text-xs">
                      <div className="flex items-center gap-3 text-zinc-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong className="text-zinc-100">{plan.monthlyEmailLimit.toLocaleString()}</strong> emails / month
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong className="text-zinc-100">{plan.templateLimit.toLocaleString()}</strong> template designs
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong className="text-zinc-100">{plan.memberLimit.toLocaleString()}</strong> team member limits
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Full delivery & open event tracking</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>REST API & SMTP dispatch</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-8">
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      isLoading={isCheckingOutThis}
                      disabled={isCurrent || (Boolean(checkoutPlanCode) && !isCheckingOutThis)}
                      variant={isRecommended ? 'primary' : isCurrent ? 'secondary' : 'outline'}
                      size="lg"
                      className="w-full"
                      rightIcon={!isCurrent && <ArrowRight className="w-4 h-4" />}
                    >
                      {isCurrent
                        ? 'Current Plan'
                        : !isAuthenticated
                        ? plan.code === 'FREE'
                          ? 'Get Started Free'
                          : `Start with ${plan.name}`
                        : plan.code === 'FREE'
                        ? 'Downgrade to FREE'
                        : `Upgrade to ${plan.name}`}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Informational Assurance Notice */}
        <div className="pt-8 max-w-2xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure Razorpay Checkout • Instant Entitlement Activation • Cancel Anytime</span>
          </div>
        </div>
      </main>
    </div>
  );
}
