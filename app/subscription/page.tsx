"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/plans";

type RazorpayCheckoutInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: Record<string, string>) => Promise<void> | void;
      theme?: { color: string };
      prefill?: { name?: string; email?: string };
    }) => RazorpayCheckoutInstance;
  }
}

export default function SubscriptionPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCheckoutScript = async () => {
    if (typeof window === "undefined") {
      return false;
    }

    if (window.Razorpay) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const orderResponse = await fetch("/api/payments/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const orderData = (await orderResponse.json()) as {
        error?: string;
        order?: { id?: string; amount?: number };
        plan?: { displayAmount?: string; name?: string };
      };

      if (!orderResponse.ok || !orderData.order || !orderData.plan) {
        setErrorMessage(orderData.error ?? "Unable to create checkout session.");
        return;
      }

      const scriptReady = await loadCheckoutScript();

      if (!scriptReady || !window.Razorpay) {
        setErrorMessage("Razorpay checkout script failed to load. Check the environment configuration.");
        return;
      }

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
      const checkout = new window.Razorpay({
        key,
        amount: Number(orderData.order.amount ?? 0),
        currency: "INR",
        name: "ProjectionPro",
        description: orderData.plan.name ?? "Plan purchase",
        order_id: orderData.order.id ?? "",
        handler: async (response) => {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              planId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = (await verifyResponse.json()) as {
            error?: string;
            message?: string;
          };

          if (!verifyResponse.ok) {
            setErrorMessage(verifyData.error ?? "Payment verification failed.");
            return;
          }

          setStatusMessage(verifyData.message ?? "Payment verified successfully.");
        },
        theme: {
          color: "#0f172a",
        },
      });

      checkout.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start checkout.";
      setErrorMessage(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <AppShell title="Subscription" subtitle="Manage your access plan and billing status.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Plan status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="text-3xl font-semibold text-slate-900">Annual Access</div>
            <div className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
              Active
            </div>
            <p className="text-slate-600">Valid until 03 Oct 2027.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Choose a plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {Object.values(PLANS).map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                  plan.id === "annual"
                    ? "border-sky-200 bg-sky-50 hover:bg-sky-100"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold text-slate-900">{plan.displayAmount} / {plan.durationDays === 30 ? "30 days" : "365 days"}</div>
                    <div className="mt-1 text-sm text-slate-600">{plan.name}</div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    {loadingPlan === plan.id ? "Processing..." : "Pay now"}
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {statusMessage ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}
    </AppShell>
  );
}
