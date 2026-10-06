import { NextResponse } from "next/server";

import { createIndustryLibraryWorkbook } from "@/lib/projection-workbook";

export async function GET() {
  try {
    const workbook = createIndustryLibraryWorkbook();
    const bytes = await workbook.xlsx.writeBuffer();
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Projection-Industry-Library.xlsx"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not create the industry library workbook." }, { status: 500 });
  }
}
