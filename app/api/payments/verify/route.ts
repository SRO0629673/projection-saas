import { NextResponse } from "next/server";

import { getPlanById } from "@/lib/plans";
import { createRazorpayClient, verifyPaymentSignature } from "@/lib/razorpay";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: {
    planId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!planId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification payload." }, { status: 400 });
  }

  const plan = getPlanById(planId);

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to verify this payment." }, { status: 401 });

  const admin = await createAdminSupabaseClient();
  const razorpay = createRazorpayClient();
  if (!admin || !razorpay) {
    return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
  }

  const isValid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  try {
    const { data: transaction, error: transactionError } = await admin
      .from("payment_transactions")
      .select("id, user_id, plan_id, amount_paise, currency, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (transactionError || !transaction || transaction.user_id !== user.id || transaction.plan_id !== plan.id) {
      return NextResponse.json({ error: "Payment order does not belong to this account or plan." }, { status: 400 });
    }

    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ]);
    const notes = order.notes as Record<string, string> | undefined;
    if (
      payment.order_id !== order.id ||
      payment.status !== "captured" ||
      payment.amount !== plan.amount ||
      payment.currency !== "INR" ||
      order.amount !== plan.amount ||
      order.currency !== "INR" ||
      notes?.plan_id !== plan.id ||
      notes?.user_id !== user.id
    ) {
      return NextResponse.json({ error: "Razorpay payment is not captured for this plan and account." }, { status: 400 });
    }

    const capturedAt = payment.created_at
      ? new Date(payment.created_at * 1000).toISOString()
      : new Date().toISOString();
    const { error: activationError } = await admin.rpc("activate_subscription_for_payment", {
      p_razorpay_order_id: razorpay_order_id,
      p_razorpay_payment_id: razorpay_payment_id,
      p_captured_at: capturedAt,
    });
    if (activationError) {
      return NextResponse.json({ error: "Payment is captured but access activation needs support review." }, { status: 503 });
    }
  } catch {
    return NextResponse.json({ error: "Could not verify the payment status with Razorpay." }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    planId: plan.id,
    status: "verified",
    message: "Payment verified successfully.",
  });
}
