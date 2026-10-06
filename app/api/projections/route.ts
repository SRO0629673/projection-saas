import { NextResponse } from "next/server";

import { calculateProjection } from "@/features/projection/engine/calculateProjection";
import type { ProjectionInput } from "@/features/projection/types";
import type { Json } from "@/lib/supabase/database";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  let query = supabase.from("projection_reports").select("id, business_name, sector, status, input, result, created_at, updated_at").eq("user_id", user.id);
  if (id) query = query.eq("id", id);
  else query = query.order("updated_at", { ascending: false });

  const { data, error } = id ? await query.maybeSingle() : await query;
  if (error) return NextResponse.json({ error: "Could not load saved projections." }, { status: 500 });
  return NextResponse.json({ reports: data });
}

async function saveReport(request: Request, updateId?: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let body: { id?: string; input?: ProjectionInput };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.input || typeof body.input.businessName !== "string" || !body.input.businessName.trim() ||
    typeof body.input.applicantName !== "string" || !body.input.applicantName.trim() ||
    typeof body.input.sector !== "string" || !body.input.finance || !body.input.assumptions) {
    return NextResponse.json({ error: "Projection input is invalid." }, { status: 400 });
  }
  const input = body.input;
  const numericValues = [
    input.finance?.loanAmount,
    input.finance?.subsidy,
    input.finance?.promoterContribution,
    input.finance?.interestRate,
    input.finance?.loanTenureYears,
    input.finance?.projectionYears,
    input.finance?.firstYearTurnover,
    ...Object.entries(input.assumptions ?? {}).filter(([key]) => key !== "sectorName").map(([, value]) => value),
    ...(input.existingGoldLoan ? [input.existingGoldLoan.outstandingAmount, input.existingGoldLoan.interestRate, input.existingGoldLoan.tenureYears] : []),
    ...(input.existingTermLoan ? [input.existingTermLoan.outstandingAmount, input.existingTermLoan.interestRate, input.existingTermLoan.remainingRepaymentYears] : []),
  ];
  if (numericValues.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return NextResponse.json({ error: "All financial values must be finite numbers." }, { status: 400 });
  }
  if (
    input.finance.projectionYears < 1 || input.finance.projectionYears > 30 ||
    input.finance.loanTenureYears < 1 || input.finance.loanTenureYears > 50 ||
    input.finance.loanAmount < 0 || input.finance.subsidy < 0 ||
    input.finance.promoterContribution < 0 || input.finance.firstYearTurnover < 0 ||
    input.finance.interestRate < 0 || input.finance.interestRate > 1 ||
    (input.existingGoldLoan !== undefined && (
      input.existingGoldLoan.outstandingAmount < 0 || input.existingGoldLoan.interestRate < 0 ||
      input.existingGoldLoan.interestRate > 1 || input.existingGoldLoan.tenureYears < 1 || input.existingGoldLoan.tenureYears > 50
    )) ||
    (input.existingTermLoan !== undefined && (
      input.existingTermLoan.outstandingAmount < 0 || input.existingTermLoan.interestRate < 0 ||
      input.existingTermLoan.interestRate > 1 || input.existingTermLoan.remainingRepaymentYears < 1 ||
      input.existingTermLoan.remainingRepaymentYears > 50
    ))
  ) {
    return NextResponse.json({ error: "Projection period is outside the supported range." }, { status: 400 });
  }
  const result = calculateProjection(input);

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (subscriptionError) return NextResponse.json({ error: "Could not verify account access." }, { status: 500 });
  if (!subscription) return NextResponse.json({ error: "An active subscription is required to generate and save reports." }, { status: 403 });

  const values = {
    business_name: input.businessName,
    sector: input.sector,
    status: result.status,
    input: JSON.parse(JSON.stringify(input)) as Json,
    result: JSON.parse(JSON.stringify(result)) as Json,
    updated_at: new Date().toISOString(),
  };
  const query = updateId
    ? supabase.from("projection_reports").update(values).eq("id", updateId).eq("user_id", user.id)
    : supabase.from("projection_reports").insert({ ...values, user_id: user.id });
  const { data, error } = await query
    .select("id, business_name, sector, status, input, result, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: "Could not save the projection." }, { status: 500 });
  return NextResponse.json({ report: data }, { status: updateId ? 200 : 201 });
}

export async function POST(request: Request) {
  return saveReport(request);
}

export async function PUT(request: Request) {
  let body: { id?: string };
  try {
    body = (await request.clone().json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "Report ID is required for updates." }, { status: 400 });
  return saveReport(request, body.id);
}