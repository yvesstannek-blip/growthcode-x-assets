import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/google";
import { saveGoogleTokens } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const cookie = req.headers.get("cookie")?.match(/(?:^|; )g_state=([^;]+)/)?.[1];
  const code = url.searchParams.get("code");
  if (!code || !state || state !== cookie) return NextResponse.json({ error: "invalid OAuth response" }, { status: 400 });
  try {
    await saveGoogleTokens(await exchangeCode(code));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "OAuth failed" }, { status: 502 });
  }
  const res = NextResponse.redirect(new URL("/dashboard", url.origin));
  res.cookies.delete("g_state");
  return res;
}
