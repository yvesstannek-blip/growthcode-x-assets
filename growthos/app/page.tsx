"use client";
import { useState } from "react";
import type { CompanyUnderstanding } from "@/lib/understanding";

const List = ({ title, items }: { title: string; items: string[] }) =>
  items.length ? (
    <div>
      <h3 className="text-xs uppercase tracking-wide text-zinc-400">{title}</h3>
      <ul className="mt-1 list-disc pl-5 text-sm">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>
  ) : null;

export default function Onboarding() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompanyUnderstanding | null>(null);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.understanding);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">GrowthOS</h1>
      <p className="mt-2 text-zinc-400">Connect your business. Set your goal. Let GrowthOS grow it.</p>
      <form onSubmit={analyze} className="mt-8 flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="socialinfluencerwall.com"
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
        <button disabled={busy || !url} className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-zinc-950 disabled:opacity-50">
          {busy ? "Analysiere…" : "Analysieren"}
        </button>
      </form>
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {result && (
        <section className="mt-8 space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-lg font-medium">So verstehen wir dein Unternehmen</h2>
          <p className="font-semibold">{result.company}</p>
          <p className="text-sm text-zinc-300">{result.summary}</p>
          <List title="Produkte / Angebote" items={result.products} />
          <List title="Zielgruppen" items={result.audiences} />
          <List title="USPs" items={result.usps} />
          <List title="Conversion-Ziele" items={result.conversionGoals} />
          <List title="SEO-Beobachtungen" items={result.seoObservations} />
          <p className="text-xs text-zinc-500">Sprache: {result.language} · Ton: {result.tone} · Quelle: {result.source}</p>
        </section>
      )}
    </main>
  );
}
