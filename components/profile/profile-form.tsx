"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

const professions = [
  "Chartered Accountant",
  "GST Practitioner",
  "Accountant / Tax Practitioner",
  "Cost Accountant / CMA",
  "Company Secretary / CS",
  "Other",
];

export function ProfileForm({
  initialValues,
}: {
  initialValues: { fullName: string; email: string; mobile: string; profession: string };
}) {
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [mobile, setMobile] = useState(initialValues.mobile);
  const [profession, setProfession] = useState(initialValues.profession);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setSaving(false);
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Your session has expired. Sign in again to update your profile.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? initialValues.email,
      full_name: fullName.trim(),
      mobile: mobile.trim() || null,
      profession,
    });
    setSaving(false);
    if (updateError) {
      setError("Could not save your profile. Confirm the Supabase migration has been applied.");
      return;
    }
    setMessage("Profile updated.");
  }

  return (
    <form onSubmit={saveProfile} className="max-w-3xl space-y-6">
      <div className="grid gap-5 border-y border-slate-200 py-6 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Full name
          <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3" />
        </label>
        <label className="text-sm font-medium text-slate-700">Email
          <input type="email" readOnly value={initialValues.email} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-500" />
        </label>
        <label className="text-sm font-medium text-slate-700">Mobile
          <input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3" />
        </label>
        <label className="text-sm font-medium text-slate-700">Profession
          <select value={profession} onChange={(event) => setProfession(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3">
            {professions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      {message ? <p role="status" className="text-sm text-emerald-800">{message}</p> : null}
      <button type="submit" disabled={saving} className="min-h-10 rounded-md bg-sky-950 px-4 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-60">{saving ? "Saving..." : "Save profile"}</button>
    </form>
  );
}
