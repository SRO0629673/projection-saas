import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminContext } from "@/lib/admin";

export default async function AdminPage() {
  const { admin } = await getAdminContext();
  if (!admin) {
    return <main className="mx-auto max-w-7xl px-4 py-12"><h1 className="text-3xl font-semibold">Admin overview</h1><p className="mt-4 text-slate-600">Configure SUPABASE_SERVICE_ROLE_KEY to load live administration data.</p></main>;
  }

  const [profiles, subscriptions, payments] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("subscriptions").select("id, plan_id, ends_at"),
    admin.from("payment_transactions").select("amount_paise").eq("status", "captured"),
  ]);
  const activeSubscriptions = (subscriptions.data ?? []).filter((subscription) => new Date(subscription.ends_at) > new Date());
  const totalRevenuePaise = (payments.data ?? []).reduce((total, payment) => total + payment.amount_paise, 0);
  const stats = [
    { label: "Registered users", value: profiles.count ?? 0 },
    { label: "Active access", value: activeSubscriptions.length },
    { label: "Expired subscriptions", value: (subscriptions.data ?? []).length - activeSubscriptions.length },
    { label: "Active 30-day plans", value: activeSubscriptions.filter((subscription) => subscription.plan_id === "monthly").length },
    { label: "Active annual plans", value: activeSubscriptions.filter((subscription) => subscription.plan_id === "annual").length },
    { label: "Captured payments", value: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(totalRevenuePaise / 100) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Overview</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base text-slate-600">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
