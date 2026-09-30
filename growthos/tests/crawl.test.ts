import { describe, expect, it } from "vitest";
import { isPrivateHost, normalizeUrl, parsePage } from "@/lib/crawl";
import { heuristicUnderstanding } from "@/lib/understanding";

describe("crawl", () => {
  it("normalizes bare domains", () => expect(normalizeUrl("example.com").toString()).toBe("https://example.com/"));
  it("blocks private hosts", () => {
    for (const h of ["localhost", "127.0.0.1", "10.1.2.3", "192.168.0.1", "172.20.0.1", "169.254.169.254", "::1"]) expect(isPrivateHost(h)).toBe(true);
    expect(isPrivateHost("example.com")).toBe(false);
  });
  it("parses page basics", () => {
    const p = parsePage(`<title>Acme | Tools</title><meta name="description" content="d"><h1>Hi</h1><a href="/x">Join now</a><script>bad()</script>`, "https://acme.com/");
    expect(p.title).toBe("Acme | Tools");
    expect(p.ctas).toEqual(["Join now"]);
    expect(p.text).not.toContain("bad()");
    expect(p.links).toEqual(["https://acme.com/x"]);
  });
  it("heuristic understanding flags missing meta", () => {
    const u = heuristicUnderstanding([parsePage("<title>Acme</title><h1>Hi</h1>", "https://acme.com/")]);
    expect(u.company).toBe("Acme");
    expect(u.seoObservations).toContain("Homepage has no meta description.");
  });
});
