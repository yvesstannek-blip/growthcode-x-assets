import Link from "next/link";
import { redirect } from "next/navigation";
import { recommend } from "@/lib/growthManager";
import { googleConfigured } from "@/lib/google";
import { getSeoData } from "@/lib/seoData";
import { loadWorkspace } from "@/lib/store";

export const dynamic = "force-dynamic";

const badge = { high: "bg-red-500/20 text-red-300", medium: "bg-amber-500/20 text-amber-300", low: "bg-zinc-700 text-zinc-300" };

export default async function Dashboard() {
  const ws = await loadWorkspace();
  if (!ws || !ws.confirmed) redirect("/");
  const recs = recommend(ws);
  const seo = await getSeoData(ws);
  const g = ws.goal;
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">{ws.understanding.company}</h1>
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">Neu analysieren</Link>
      </div>
      {g && (
        <section className="mt-6 grid grid-cols-3 gap-3">
          {[["Ziel", `${g.target.toLocaleString("de-DE")} ${g.metric}`], ["Aktuell", g.current.toLocaleString("de-DE")], ["Bis", g.deadline]].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-xs uppercase tracking-wide text-zinc-400">{k}</div>
              <div className="mt-1 text-lg font-medium">{v}</div>
            </div>
          ))}
        </section>
      )}
      <p className="mt-3 text-xs text-zinc-500">Traffic, Registrierungen und Kanäle erscheinen, sobald Analytics und Accounts verbunden sind.</p>
      <section className="mt-8">
        <h2 className="text-lg font-medium">SEO-Chancen (Search Console)</h2>
        {seo.source === "demo" && (
          <p className="mt-2 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            Demo-Daten, nicht deine echten Zahlen.{" "}
            {googleConfigured() ? <a className="underline" href="/api/google/connect">Search Console verbinden</a> : "Google-Zugangsdaten fehlen (siehe .env.example)."}
          </p>
        )}
        {seo.source === "live" && <p className="mt-2 text-xs text-zinc-500">Live-Daten: {seo.site}, letzte 28 Tage. Geschätztes Potenzial basiert auf Branchen-Durchschnitts-CTRs.</p>}
        {seo.source === "error" && <p className="mt-2 text-sm text-red-400">{seo.message}</p>}
        <ul className="mt-3 space-y-2">
          {seo.opportunities.slice(0, 8).map((o) => (
            <li key={o.query} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex justify-between gap-2">
                <span className="font-medium">{o.query}</span>
                <span className="text-sm text-emerald-400">+{o.estimatedExtraClicks} Klicks möglich</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{o.impressions.toLocaleString("de-DE")} Impressions · Position {o.position.toFixed(1)} · CTR {(o.ctr * 100).toFixed(1)} %</p>
              <p className="mt-1 text-sm text-zinc-300">{o.action}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-medium">AI Growth Manager</h2>
        <ul className="mt-3 space-y-2">
          {recs.map((r) => (
            <li key={r.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs ${badge[r.impact]}`}>{r.impact}</span>
                <span className="font-medium">{r.title}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{r.reason}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
