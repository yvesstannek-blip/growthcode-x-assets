import { promises as fs } from "node:fs";
import path from "node:path";
import { Workspace } from "./workspace";

// File-based store for the single-workspace MVP; replaced by PostgreSQL later.
const FILE = process.env.GROWTHOS_DATA_FILE || path.join(process.cwd(), ".data", "workspace.json");

export async function loadWorkspace(): Promise<Workspace | null> {
  try {
    const parsed = Workspace.safeParse(JSON.parse(await fs.readFile(FILE, "utf8")));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function saveWorkspace(ws: Workspace): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(ws, null, 2));
}
