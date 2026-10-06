import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return <AppShell title="Profile" subtitle="Manage your professional account details."><p className="text-slate-600">Configure Supabase to load and update your account profile.</p></AppShell>;
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <AppShell title="Profile"><p className="text-slate-600">Sign in to manage your profile.</p></AppShell>;
  const { data: profile } = await supabase.from("profiles").select("full_name, email, mobile, profession").eq("id", user.id).maybeSingle();

  return (
    <AppShell title="Profile" subtitle="Manage your professional account details.">
      <ProfileForm initialValues={{
        fullName: profile?.full_name ?? String(user.user_metadata.full_name ?? ""),
        email: profile?.email ?? user.email ?? "",
        mobile: profile?.mobile ?? "",
        profession: profile?.profession ?? String(user.user_metadata.profession ?? "Other"),
      }} />
    </AppShell>
  );
}
