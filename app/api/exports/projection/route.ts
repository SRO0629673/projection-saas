import { NextResponse } from "next/server";

import { calculateProjection } from "@/features/projection/engine/calculateProjection";
import type { ProjectionInput } from "@/features/projection/types";
import { createProjectionWorkbook } from "@/lib/projection-workbook";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: { id?: string; input?: ProjectionInput };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid export request." }, { status: 400 });
  }

  let input = body.input;
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!body.id) return NextResponse.json({ error: "Saved report ID is required." }, { status: 400 });
    const { data, error } = await supabase.from("projection_reports")
      .select("input")
      .eq("id", body.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Saved report was not found." }, { status: 404 });
    input = data.input as unknown as ProjectionInput;
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Configure Supabase before exporting reports." }, { status: 503 });
  }

  if (!input || typeof input.businessName !== "string" || !input.finance || !input.assumptions) {
    return NextResponse.json({ error: "Projection export input is invalid." }, { status: 400 });
  }

  try {
    const result = calculateProjection(input);
    const workbook = createProjectionWorkbook({ input, result });
    const bytes = await workbook.xlsx.writeBuffer();
    const filename = `Projection_${input.businessName.replace(/[^a-z0-9_-]+/gi, "_")}.xlsx`;
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not create the projection workbook." }, { status: 500 });
  }
}
