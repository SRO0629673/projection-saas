import type { ReactNode } from "react";

import { getAdminContext } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await getAdminContext();
  return children;
}