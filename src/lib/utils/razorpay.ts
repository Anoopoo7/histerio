export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
  razorpay_order_id?: string;
}

export interface OpenRazorpayOptions {
  keyId: string;
  subscriptionId: string;
  planName: string;
  userName?: string;
  userEmail?: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
  onError?: (error: string) => void;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      subscription_id: string;
      name: string;
      description: string;
      handler: (response: RazorpaySuccessResponse) => void;
      modal?: {
        ondismiss?: () => void;
      };
      prefill?: {
        name?: string;
        email?: string;
      };
      theme?: {
        color?: string;
      };
    }) => RazorpayInstance;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const scriptId = 'razorpay-checkout-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  keyId,
  subscriptionId,
  planName,
  userName,
  userEmail,
  onSuccess,
  onDismiss,
  onError,
}: OpenRazorpayOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    if (onError) onError('Failed to load Razorpay payment gateway. Please check your internet connection.');
    return;
  }

  try {
    const rzp = new window.Razorpay({
      key: keyId,
      subscription_id: subscriptionId,
      name: 'Histeria Email SaaS',
      description: `${planName} Plan Subscription`,
      handler: (response: RazorpaySuccessResponse) => {
        onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
      prefill: {
        name: userName || '',
        email: userEmail || '',
      },
      theme: {
        color: '#6366f1',
      },
    });

    rzp.open();
  } catch (err) {
    if (onError) {
      onError(err instanceof Error ? err.message : 'Failed to initialize payment window');
    }
  }
}
