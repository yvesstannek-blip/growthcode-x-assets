import { NextResponse } from "next/server";
import { loadWorkspace, saveWorkspace } from "@/lib/store";
import { Workspace } from "@/lib/workspace";

export async function GET() {
  return NextResponse.json({ workspace: await loadWorkspace() });
}

export async function PUT(req: Request) {
  const parsed = Workspace.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid workspace", issues: parsed.error.issues }, { status: 400 });
  await saveWorkspace(parsed.data);
  return NextResponse.json({ workspace: parsed.data });
}
