import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminContext } from "@/lib/admin";

export default async function AdminUsersPage({ searchParams }: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const search = q.trim().toLocaleLowerCase();
  const { admin } = await getAdminContext();
  if (!admin) return <main className="mx-auto max-w-7xl px-4 py-12"><h1 className="text-3xl font-semibold">Users</h1><p className="mt-4 text-slate-600">Configure SUPABASE_SERVICE_ROLE_KEY to load user records.</p></main>;

  const [usersResult, subscriptionsResult, reportsResult] = await Promise.all([
    admin.from("profiles").select("id, email, full_name, mobile, profession, created_at").order("created_at", { ascending: false }),
    admin.from("subscriptions").select("user_id, starts_at, ends_at").lte("starts_at", new Date().toISOString()).order("ends_at", { ascending: false }),
    admin.from("projection_reports").select("user_id"),
  ]);
  if (usersResult.error || subscriptionsResult.error || reportsResult.error) {
    return <main className="mx-auto max-w-7xl px-4 py-12"><h1 className="text-3xl font-semibold">Users</h1><p role="alert" className="mt-4 text-slate-600">Could not load user records. Check the database migrations and try again.</p></main>;
  }
  const users = (usersResult.data ?? []).filter((user) =>
    [user.full_name, user.email, user.mobile].some((value) => value?.toLocaleLowerCase().includes(search)),
  );
  const subscriptions = subscriptionsResult.data;
  const reportCounts = new Map<string, number>();
  for (const report of reportsResult.data ?? []) {
    reportCounts.set(report.user_id, (reportCounts.get(report.user_id) ?? 0) + 1);
  }
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

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <label htmlFor="user-search" className="flex min-w-64 flex-1 flex-col gap-2 text-sm font-medium text-slate-700">
          Search by name, email or mobile
          <input id="user-search" name="q" defaultValue={q} maxLength={200} type="search" className="h-10 rounded-md border border-slate-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-sky-700" />
        </label>
        <button type="submit" className="h-10 rounded-md bg-sky-800 px-4 text-sm font-medium text-white hover:bg-sky-900">Search users</button>
        {q ? <a href="/admin/users" className="px-3 py-2 text-sm font-medium text-sky-800 underline">Clear search</a> : null}
      </form>
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
                  <th className="pb-3 pr-4 font-medium">Reports</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((user) => {
                  const expiry = latestExpiry.get(user.id);
                  const isActive = expiry ? new Date(expiry) > new Date() : false;
                  return (
                  <tr key={user.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">{user.full_name || "—"}</td>
                    <td className="py-3 pr-4">{user.email ?? "—"}</td>
                    <td className="py-3 pr-4">{user.mobile ?? "—"}</td>
                    <td className="py-3 pr-4">{user.profession}</td>
                    <td className="py-3 pr-4">{reportCounts.get(user.id) ?? 0}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {isActive ? "Active" : "No active access"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{expiry ? new Date(expiry).toLocaleDateString("en-IN") : "—"}</td>
                  </tr>
                  );
                })}
                {(users ?? []).length === 0 ? <tr><td colSpan={7} className="py-6 text-center text-slate-500">{q ? "No users match your search." : "No registered users."}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
