import { AppShell } from "@/components/layout/app-shell";
import { SavedReports } from "@/components/projection/saved-reports";

export default function ReportsPage() {
  return (
    <AppShell title="Reports" subtitle="Review and manage saved projection reports in this browser.">
      <SavedReports />
    </AppShell>
  );
}
