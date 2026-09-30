import { NextResponse } from "next/server";
import { crawlSite } from "@/lib/crawl";
import { understandCompany } from "@/lib/understanding";

export async function POST(req: Request) {
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  try {
    const pages = await crawlSite(url);
    const understanding = await understandCompany(pages);
    return NextResponse.json({ understanding, pages: pages.map((p) => p.url) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "analysis failed" }, { status: 422 });
  }
}
