import type { Workspace } from "./workspace";

export type Recommendation = {
  id: string;
  title: string;
  reason: string;
  impact: "high" | "medium" | "low";
};

const order = { high: 0, medium: 1, low: 2 } as const;

// Deterministic rules over what we actually know. No invented metrics:
// anything needing analytics/social data is listed as a setup step instead.
export function recommend(ws: Workspace, now = new Date()): Recommendation[] {
  const u = ws.understanding;
  const out: Recommendation[] = [];

  for (const obs of u.seoObservations) {
    out.push({
      id: `seo:${obs.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
      title: "Fix SEO basics on the homepage",
      reason: obs,
      impact: /title|description/i.test(obs) ? "high" : "medium",
    });
  }
  if (!u.audiences.length)
    out.push({ id: "audience", title: "Define your target audiences", reason: "No audience was detected; content and outreach need a concrete target.", impact: "high" });
  if (!u.usps.length)
    out.push({ id: "usp", title: "Add your unique selling points", reason: "No USPs were detected; hooks and CTAs build on them.", impact: "medium" });
  if (!u.conversionGoals.length)
    out.push({ id: "cta", title: "Add a clear call to action", reason: "No CTA was found on the analyzed pages, so traffic cannot convert.", impact: "high" });

  out.push({ id: "connect-analytics", title: "Connect Google Analytics and Search Console", reason: "Needed to measure traffic and registrations and to find keyword opportunities.", impact: "high" });
  out.push({ id: "connect-social", title: "Connect your social accounts", reason: "Needed for publishing, inbox and relationship tracking.", impact: "medium" });

  if (ws.goal) {
    const left = ws.goal.target - ws.goal.current;
    const days = Math.ceil((Date.parse(ws.goal.deadline) - now.getTime()) / 86_400_000);
    if (left > 0 && days > 0) {
      out.push({ id: "pace", title: `Required pace: ${Math.ceil(left / days)} ${ws.goal.metric}/day`, reason: `${left} to go in ${days} days.`, impact: "medium" });
    } else if (left > 0) {
      out.push({ id: "pace", title: "Goal deadline has passed", reason: `${left} still missing. Set a new deadline.`, impact: "high" });
    }
  }
  return out.sort((a, b) => order[a.impact] - order[b.impact]);
}
