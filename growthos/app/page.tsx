"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CompanyUnderstanding } from "@/lib/understanding";

const listFields = [
  ["products", "Produkte / Angebote"],
  ["audiences", "Zielgruppen"],
  ["usps", "USPs"],
  ["conversionGoals", "Conversion-Ziele"],
  ["seoObservations", "SEO-Beobachtungen"],
] as const;

const input = "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm";

export default function Onboarding() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [u, setU] = useState<CompanyUnderstanding | null>(null);
  const [metric, setMetric] = useState("Creator-Registrierungen");
  const [target, setTarget] = useState("10000");
  const [deadline, setDeadline] = useState("");

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setU(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setU(data.understanding);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!u) return;
    setBusy(true); setError("");
    const res = await fetch("/api/workspace", {
      method: "PUT",
      body: JSON.stringify({ url, understanding: u, confirmed: true, goal: { metric, target: Number(target), deadline, current: 0 } }),
    });
    setBusy(false);
    if (!res.ok) return setError("Speichern fehlgeschlagen. Bitte Ziel und Datum prüfen.");
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">GrowthOS</h1>
      <p className="mt-2 text-zinc-400">Connect your business. Set your goal. Let GrowthOS grow it.</p>
      <form onSubmit={analyze} className="mt-8 flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="socialinfluencerwall.com" className={input} />
        <button disabled={busy || !url} className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-zinc-950 disabled:opacity-50">
          {busy && !u ? "Analysiere…" : "Analysieren"}
        </button>
      </form>
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {u && (
        <form onSubmit={confirm} className="mt-8 space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-medium">So verstehen wir dein Unternehmen</h2>
          <p className="text-xs text-zinc-500">Quelle: {u.source === "ai" ? "KI-Analyse" : "einfache Regel-Analyse (ohne API-Key)"}. Bitte prüfen und korrigieren.</p>
          <label className="block text-sm">Firma<input className={input} value={u.company} onChange={(e) => setU({ ...u, company: e.target.value })} /></label>
          <label className="block text-sm">Zusammenfassung<textarea rows={3} className={input} value={u.summary} onChange={(e) => setU({ ...u, summary: e.target.value })} /></label>
          {listFields.map(([key, label]) => (
            <label key={key} className="block text-sm">{label} (eine pro Zeile)
              <textarea rows={3} className={input} value={u[key].join("\n")}
                onChange={(e) => setU({ ...u, [key]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
            </label>
          ))}
          <h2 className="pt-2 text-lg font-medium">Geschäftsziel</h2>
          <div className="grid grid-cols-3 gap-2">
            <label className="col-span-3 text-sm sm:col-span-1">Kennzahl<input className={input} value={metric} onChange={(e) => setMetric(e.target.value)} /></label>
            <label className="text-sm">Zielwert<input type="number" min={1} className={input} value={target} onChange={(e) => setTarget(e.target.value)} /></label>
            <label className="text-sm">Bis<input type="date" required className={input} value={deadline} onChange={(e) => setDeadline(e.target.value)} /></label>
          </div>
          <button disabled={busy || !deadline} className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-zinc-950 disabled:opacity-50">Bestätigen und starten</button>
        </form>
      )}
    </main>
  );
}
