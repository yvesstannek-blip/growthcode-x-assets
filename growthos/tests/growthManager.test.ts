import { describe, expect, it } from "vitest";
import { recommend } from "@/lib/growthManager";
import type { Workspace } from "@/lib/workspace";

const base = (over: Partial<Workspace> = {}): Workspace => ({
  url: "acme.com",
  confirmed: true,
  goal: { metric: "Signups", target: 1000, current: 100, deadline: "2026-12-31" },
  understanding: {
    company: "Acme", summary: "s", products: [], audiences: ["Creators"], usps: ["Fast"], language: "en", tone: "friendly",
    conversionGoals: ["Join now"], seoObservations: ["Homepage has no meta description."], source: "heuristic",
  },
  ...over,
});

describe("recommend", () => {
  it("ranks high impact first and flags SEO issues", () => {
    const recs = recommend(base(), new Date("2026-10-01"));
    expect(recs[0].impact).toBe("high");
    expect(recs.some((r) => r.reason.includes("meta description"))).toBe(true);
  });
  it("computes required daily pace", () => {
    const pace = recommend(base(), new Date("2026-10-01")).find((r) => r.id === "pace")!;
    expect(pace.title).toContain("Required pace: 10 Signups/day"); // 900 left / 91 days
  });
  it("flags missing audience, usp and cta", () => {
    const w = base();
    w.understanding = { ...w.understanding, audiences: [], usps: [], conversionGoals: [] };
    const ids = recommend(w).map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining(["audience", "usp", "cta"]));
  });
  it("reports a passed deadline", () => {
    expect(recommend(base(), new Date("2027-02-01")).find((r) => r.id === "pace")!.title).toBe("Goal deadline has passed");
  });
});
