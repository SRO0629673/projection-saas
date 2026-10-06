import { redirect } from "next/navigation";

import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdminContext() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.app_metadata.role !== "admin") redirect("/dashboard");

  return { user, admin: await createAdminSupabaseClient() };
}