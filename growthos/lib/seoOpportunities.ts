export type QueryRow = { query: string; clicks: number; impressions: number; ctr: number; position: number };

export type SeoOpportunity = {
  query: string;
  impressions: number;
  position: number;
  ctr: number;
  kind: "ctr" | "striking-distance";
  estimatedExtraClicks: number;
  action: string;
};

// Rough organic CTR benchmarks by position (industry averages, used only to estimate potential).
const BENCH: Record<number, number> = { 1: 0.28, 2: 0.15, 3: 0.1, 4: 0.07, 5: 0.05, 6: 0.04, 7: 0.03, 8: 0.025, 9: 0.02, 10: 0.018 };
export const benchCtr = (pos: number) => BENCH[Math.max(1, Math.round(pos))] ?? 0.01;

export function findOpportunities(rows: QueryRow[], opts = { minImpressions: 200 }): SeoOpportunity[] {
  const out: SeoOpportunity[] = [];
  for (const r of rows) {
    if (r.impressions < opts.minImpressions) continue;
    if (r.position > 10 && r.position <= 20) {
      // Page 2: moving to position 5 is the realistic goal.
      out.push({
        ...pick(r), kind: "striking-distance",
        estimatedExtraClicks: Math.round(r.impressions * (benchCtr(5) - r.ctr)),
        action: "Optimize title and H1, add FAQ/schema, expand content and add internal links.",
      });
    } else if (r.position <= 10 && r.ctr < benchCtr(r.position) * 0.6) {
      out.push({
        ...pick(r), kind: "ctr",
        estimatedExtraClicks: Math.round(r.impressions * (benchCtr(r.position) - r.ctr)),
        action: "Already on page 1 but the snippet underperforms: rewrite title and meta description.",
      });
    }
  }
  return out.filter((o) => o.estimatedExtraClicks > 0).sort((a, b) => b.estimatedExtraClicks - a.estimatedExtraClicks);
}

const pick = (r: QueryRow) => ({ query: r.query, impressions: r.impressions, position: r.position, ctr: r.ctr });

// Clearly labelled sample data, used only when Search Console is not connected.
export const DEMO_ROWS: QueryRow[] = [
  { query: "creator collaboration platform", clicks: 76, impressions: 8420, ctr: 0.009, position: 11.3 },
  { query: "micro influencers germany", clicks: 40, impressions: 3100, ctr: 0.013, position: 14.8 },
  { query: "influencer marketplace", clicks: 120, impressions: 6400, ctr: 0.019, position: 6.2 },
  { query: "find brand collaborations", clicks: 5, impressions: 150, ctr: 0.03, position: 12 },
  { query: "influencerwall", clicks: 900, impressions: 1500, ctr: 0.6, position: 1.1 },
];
