import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function CmaPage() {
  return (
    <AppShell title="CMA Report" subtitle="Currently under development.">
      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          <div className="text-2xl font-semibold text-slate-900">CMA Reports — Coming Soon</div>
          <p className="mt-4 text-slate-600">
            CMA functionality is currently under development and will be introduced in a future phase of the product.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
