import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { getPlanById } from "@/lib/plans";
import { createRazorpayClient } from "@/lib/razorpay";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: { planId?: string };
  try {
    body = (await request.json()) as { planId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const plan = getPlanById(body.planId);

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Configure Supabase before enabling paid access." }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in before purchasing a plan." }, { status: 401 });

  const admin = await createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Payment records require the server-side Supabase service role configuration." }, { status: 503 });
  }

  const razorpay = createRazorpayClient();

  if (!razorpay) {
    return NextResponse.json(
      {
        error: "Razorpay is not configured yet. Add the environment variables to enable payment checkout.",
      },
      { status: 503 },
    );
  }

  try {
    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: "INR",
      receipt: `proj_${randomUUID().replaceAll("-", "").slice(0, 20)}`,
      notes: {
        plan_id: plan.id,
        plan_name: plan.name,
        user_id: user.id,
      },
    });

    const { error: recordError } = await admin.from("payment_transactions").insert({
      user_id: user.id,
      plan_id: plan.id,
      amount_paise: plan.amount,
      currency: "INR",
      razorpay_order_id: order.id,
      status: "created",
    });
    if (recordError) throw new Error("Could not persist the payment order. Contact support before retrying.");

    return NextResponse.json({ order, plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Razorpay order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
