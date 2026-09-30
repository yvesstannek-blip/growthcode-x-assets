import { describe, expect, it } from "vitest";
import { DEMO_ROWS, benchCtr, findOpportunities } from "@/lib/seoOpportunities";

describe("findOpportunities", () => {
  const opps = findOpportunities(DEMO_ROWS);
  it("finds page-2 queries and ranks by potential", () => {
    expect(opps[0].query).toBe("creator collaboration platform");
    expect(opps[0].kind).toBe("striking-distance");
    expect(opps[0].estimatedExtraClicks).toBe(Math.round(8420 * (benchCtr(5) - 0.009)));
  });
  it("flags weak CTR on page 1", () => expect(opps.find((o) => o.query === "influencer marketplace")?.kind).toBe("ctr"));
  it("ignores low-volume and already-strong queries", () => {
    const q = opps.map((o) => o.query);
    expect(q).not.toContain("find brand collaborations");
    expect(q).not.toContain("influencerwall");
  });
});
