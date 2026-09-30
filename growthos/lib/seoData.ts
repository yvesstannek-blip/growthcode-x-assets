import { accessToken, fetchQueries, findSite } from "./google";
import { DEMO_ROWS, findOpportunities, type SeoOpportunity } from "./seoOpportunities";
import { loadGoogleTokens } from "./store";
import type { Workspace } from "./workspace";

export type SeoData =
  | { source: "live"; site: string; opportunities: SeoOpportunity[] }
  | { source: "demo"; opportunities: SeoOpportunity[] }
  | { source: "error"; message: string; opportunities: [] };

export async function getSeoData(ws: Workspace): Promise<SeoData> {
  const tokens = await loadGoogleTokens();
  if (!tokens) return { source: "demo", opportunities: findOpportunities(DEMO_ROWS) };
  try {
    const token = await accessToken(tokens);
    const host = new URL(/^https?:\/\//.test(ws.url) ? ws.url : `https://${ws.url}`).host;
    const site = await findSite(token, host);
    if (!site) return { source: "error", message: `No Search Console property found for ${host} in the connected Google account.`, opportunities: [] };
    return { source: "live", site, opportunities: findOpportunities(await fetchQueries(token, site)) };
  } catch (e) {
    return { source: "error", message: e instanceof Error ? e.message : "Search Console request failed", opportunities: [] };
  }
}
