import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminContext } from "@/lib/admin";

export default async function AdminPaymentsPage() {
  const { admin } = await getAdminContext();
  if (!admin) return <main className="mx-auto max-w-7xl px-4 py-12"><h1 className="text-3xl font-semibold">Payments</h1><p className="mt-4 text-slate-600">Configure SUPABASE_SERVICE_ROLE_KEY to load payment records.</p></main>;

  const { data: payments } = await admin.from("payment_transactions")
    .select("id, user_id, plan_id, amount_paise, currency, razorpay_order_id, razorpay_payment_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const userIds = [...new Set((payments ?? []).map((payment) => payment.user_id))];
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, full_name, email").in("id", userIds)
    : { data: [] };
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Payments</h1>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Recent payments</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 pr-4 font-medium">Plan</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Provider order</th>
                  <th className="pb-3 pr-4 font-medium">Provider payment</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(payments ?? []).map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">{profileById.get(payment.user_id)?.full_name || profileById.get(payment.user_id)?.email || payment.user_id}</td>
                    <td className="py-3 pr-4">{payment.plan_id === "annual" ? "Annual" : "30-Day"}</td>
                    <td className="py-3 pr-4">{new Intl.NumberFormat("en-IN", { style: "currency", currency: payment.currency }).format(payment.amount_paise / 100)}</td>
                    <td className="py-3 pr-4">{payment.razorpay_order_id}</td>
                    <td className="py-3 pr-4">{payment.razorpay_payment_id ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${payment.status === "captured" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(payments ?? []).length === 0 ? <tr><td colSpan={6} className="py-6 text-center text-slate-500">No payment transactions.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
