import { AppShell } from "@/components/layout/app-shell";
import { DashboardReportsSummary } from "@/components/projection/dashboard-reports-summary";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  let planStatus = "Supabase not configured";
  let planName = "Local browser workspace";
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_id, ends_at")
        .eq("user_id", user.id)
        .gt("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        planName = data.plan_id === "annual" ? "Annual Access" : "30-Day Access";
        planStatus = `Active until ${new Date(data.ends_at).toLocaleDateString("en-IN")}`;
      } else {
        planName = "No active plan";
        planStatus = "Inactive";
      }
    }
  }

  return (
    <AppShell title="Dashboard" subtitle="Your projection workspace.">
      <div className="space-y-8">
        <section className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-5">
          <div><p className="text-sm text-slate-500">Current access</p><p className="mt-1 text-xl font-semibold text-slate-950">{planName}</p></div>
          <p className="text-sm text-slate-600">{planStatus}</p>
        </section>
        <DashboardReportsSummary />
      </div>
    </AppShell>
  );
}
