import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <AppShell title="Support" subtitle="Get help with your account, plan, or reporting workflow.">
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Email support</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-slate-600">
            support@projectionpro.in
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-slate-600">
            +91 98765 43210
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
