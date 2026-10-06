export default function SetupRequiredPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase text-sky-800">ProjectionPro</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950">Workspace setup required</h1>
      <p className="mt-4 leading-7 text-slate-600">Workspace access is temporarily unavailable because authentication is not configured. Please contact the site administrator.</p>
    </main>
  );
}