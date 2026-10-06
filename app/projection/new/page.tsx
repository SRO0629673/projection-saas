import { AppShell } from "@/components/layout/app-shell";
import { ProjectionBuilder } from "@/components/projection/projection-builder";

export default async function ProjectionNewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; duplicate?: string }>;
}) {
  const { id, duplicate } = await searchParams;
  return (
    <AppShell title="Projection Builder" subtitle="Build a financial projection from the recovered industry assumptions and your project inputs.">
      <div className="surface-card p-5 sm:p-7">
        <ProjectionBuilder reportId={id} duplicateId={duplicate} />
      </div>
    </AppShell>
  );
}
