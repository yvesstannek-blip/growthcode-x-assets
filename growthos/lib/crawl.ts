import * as cheerio from "cheerio";

export type CrawledPage = {
  url: string;
  title: string;
  description: string;
  headings: string[];
  text: string;
  ctas: string[];
  links: string[];
};

export function normalizeUrl(input: string): URL {
  const raw = input.trim();
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http(s) URLs are supported");
  return url;
}

// Block requests to private/loopback hosts (SSRF guard for user-supplied URLs).
export function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h.includes(":")) return h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80");
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

export function parsePage(html: string, url: string): CrawledPage {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, iframe").remove();
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();
  const headings = $("h1, h2, h3").map((_, e) => clean($(e).text())).get().filter(Boolean).slice(0, 40);
  const ctas = $("a, button")
    .map((_, e) => clean($(e).text()))
    .get()
    .filter((t) => t.length > 2 && t.length < 40 && /(start|sign|join|register|get|try|book|buy|demo|kontakt|jetzt|anmeld|registr|kostenlos|erstell)/i.test(t))
    .slice(0, 15);
  const base = new URL(url);
  const links = $("a[href]")
    .map((_, e) => {
      try {
        const u = new URL($(e).attr("href") || "", base);
        u.hash = "";
        return u.host === base.host && /^https?:$/.test(u.protocol) ? u.toString() : "";
      } catch {
        return "";
      }
    })
    .get()
    .filter(Boolean);
  return {
    url,
    title: clean($("title").first().text()),
    description: clean($('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || ""),
    headings,
    text: clean($("body").text()).slice(0, 8000),
    ctas: [...new Set(ctas)],
    links: [...new Set(links)],
  };
}

async function fetchHtml(url: string): Promise<string> {
  if (isPrivateHost(new URL(url).hostname)) throw new Error("Private hosts are not allowed");
  const res = await fetch(url, {
    headers: { "user-agent": "GrowthOS-Analyzer/0.1" },
    signal: AbortSignal.timeout(10_000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  if (!(res.headers.get("content-type") || "").includes("html")) throw new Error("Not an HTML page");
  return (await res.text()).slice(0, 1_500_000);
}

export async function crawlSite(input: string, maxPages = 5): Promise<CrawledPage[]> {
  const start = normalizeUrl(input);
  const pages: CrawledPage[] = [];
  const seen = new Set<string>();
  const queue = [start.toString()];
  while (queue.length && pages.length < maxPages) {
    const url = queue.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      const page = parsePage(await fetchHtml(url), url);
      pages.push(page);
      if (pages.length === 1) queue.push(...page.links.filter((l) => !/\.(png|jpe?g|svg|pdf|zip)$/i.test(l)));
    } catch (e) {
      if (pages.length === 0 && url === start.toString()) throw e;
    }
  }
  return pages;
}
