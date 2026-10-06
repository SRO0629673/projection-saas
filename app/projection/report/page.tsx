import { AppShell } from "@/components/layout/app-shell";
import { ProjectionReportView } from "@/components/projection/projection-report-view";

export default async function ProjectionReportPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return (
    <AppShell title="Projection Report" subtitle="Review, print, and export your saved financial projection.">
      {id ? <ProjectionReportView id={id} /> : <p className="text-slate-600">Select a saved report from Reports, or create a projection first.</p>}
    </AppShell>
  );
}
