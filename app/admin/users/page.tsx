import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminContext } from "@/lib/admin";

export default async function AdminUsersPage() {
  const { admin } = await getAdminContext();
  if (!admin) return <main className="mx-auto max-w-7xl px-4 py-12"><h1 className="text-3xl font-semibold">Users</h1><p className="mt-4 text-slate-600">Configure SUPABASE_SERVICE_ROLE_KEY to load user records.</p></main>;

  const [{ data: users }, { data: subscriptions }] = await Promise.all([
    admin.from("profiles").select("id, email, full_name, mobile, profession, created_at").order("created_at", { ascending: false }),
    admin.from("subscriptions").select("user_id, ends_at").order("ends_at", { ascending: false }),
  ]);
  const latestExpiry = new Map<string, string>();
  for (const subscription of subscriptions ?? []) {
    if (!latestExpiry.has(subscription.user_id)) latestExpiry.set(subscription.user_id, subscription.ends_at);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Users</h1>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Registered users</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Mobile</th>
                  <th className="pb-3 pr-4 font-medium">Profession</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((user) => {
                  const expiry = latestExpiry.get(user.id);
                  const isActive = expiry ? new Date(expiry) > new Date() : false;
                  return (
                  <tr key={user.email} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">{user.full_name || "—"}</td>
                    <td className="py-3 pr-4">{user.email ?? "—"}</td>
                    <td className="py-3 pr-4">{user.mobile ?? "—"}</td>
                    <td className="py-3 pr-4">{user.profession}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {isActive ? "Active" : "No active access"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{expiry ? new Date(expiry).toLocaleDateString("en-IN") : "—"}</td>
                  </tr>
                  );
                })}
                {(users ?? []).length === 0 ? <tr><td colSpan={6} className="py-6 text-center text-slate-500">No registered users.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
