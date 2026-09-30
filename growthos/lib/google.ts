import type { QueryRow } from "./seoOpportunities";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"; // read-only
export type GoogleTokens = { refreshToken: string };

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI);
}

export function authUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code", scope: SCOPE, access_type: "offline", prompt: "consent", state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, ...params }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google token error: ${data.error_description || data.error}`);
  return data as { access_token: string; refresh_token?: string };
}

export async function exchangeCode(code: string): Promise<GoogleTokens> {
  const t = await tokenRequest({ code, grant_type: "authorization_code", redirect_uri: process.env.GOOGLE_REDIRECT_URI! });
  if (!t.refresh_token) throw new Error("Google returned no refresh token");
  return { refreshToken: t.refresh_token };
}

export async function accessToken(tokens: GoogleTokens): Promise<string> {
  return (await tokenRequest({ grant_type: "refresh_token", refresh_token: tokens.refreshToken })).access_token;
}

async function api<T>(token: string, url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`Search Console API ${res.status}`);
  return res.json();
}

// Find the verified property matching the workspace host (domain property preferred).
export async function findSite(token: string, host: string): Promise<string | null> {
  const { siteEntry = [] } = await api<{ siteEntry?: { siteUrl: string }[] }>(token, "https://www.googleapis.com/webmasters/v3/sites");
  const bare = host.replace(/^www\./, "");
  const urls = siteEntry.map((s) => s.siteUrl);
  return urls.find((u) => u === `sc-domain:${bare}`) ?? urls.find((u) => { try { return new URL(u).host.replace(/^www\./, "") === bare; } catch { return false; } }) ?? null;
}

export async function fetchQueries(token: string, siteUrl: string, days = 28): Promise<QueryRow[]> {
  const end = new Date(Date.now() - 2 * 86_400_000); // Search Console data lags ~2 days
  const start = new Date(end.getTime() - days * 86_400_000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const data = await api<{ rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] }>(
    token, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", body: JSON.stringify({ startDate: iso(start), endDate: iso(end), dimensions: ["query"], rowLimit: 500 }) },
  );
  return (data.rows ?? []).map((r) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
}
