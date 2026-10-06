import { NextResponse } from "next/server";

import { verifyWebhookSignature } from "@/lib/razorpay";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid Razorpay webhook signature." }, { status: 400 });
  }

  let parsedBody: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          status?: string;
          amount?: number;
          currency?: string;
          created_at?: number;
        };
      };
    };
  };

  try {
    parsedBody = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (parsedBody.event === "payment.captured") {
    const payment = parsedBody.payload?.payment?.entity;
    if (!payment?.id || !payment.order_id || payment.status !== "captured" || payment.currency !== "INR") {
      return NextResponse.json({ error: "Captured payment payload is incomplete." }, { status: 400 });
    }

    const admin = await createAdminSupabaseClient();
    if (!admin) return NextResponse.json({ error: "Payment persistence is not configured." }, { status: 503 });

    const { data: transaction, error: transactionError } = await admin
      .from("payment_transactions")
      .select("id, amount_paise, currency")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();
    if (transactionError || !transaction || transaction.amount_paise !== payment.amount || transaction.currency !== payment.currency) {
      return NextResponse.json({ error: "Payment does not match a pending application order." }, { status: 400 });
    }

    const capturedAt = payment.created_at ? new Date(payment.created_at * 1000).toISOString() : new Date().toISOString();
    const { error: activationError } = await admin.rpc("activate_subscription_for_payment", {
      p_razorpay_order_id: payment.order_id,
      p_razorpay_payment_id: payment.id,
      p_captured_at: capturedAt,
    });
    if (activationError) return NextResponse.json({ error: "Subscription activation failed." }, { status: 503 });
    return NextResponse.json({ ok: true, status: "processed" });
  }

  return NextResponse.json({ ok: true, status: "ignored" });
}
