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

// Google refresh token. Stored in plaintext under .data (gitignored) for the single-user MVP;
// must move to an encrypted secret store before multi-user use.
const TOKEN_FILE = process.env.GROWTHOS_TOKEN_FILE || path.join(process.cwd(), ".data", "google.json");

export async function loadGoogleTokens(): Promise<{ refreshToken: string } | null> {
  try {
    const t = JSON.parse(await fs.readFile(TOKEN_FILE, "utf8"));
    return typeof t.refreshToken === "string" ? { refreshToken: t.refreshToken } : null;
  } catch {
    return null;
  }
}

export async function saveGoogleTokens(t: { refreshToken: string }): Promise<void> {
  await fs.mkdir(path.dirname(TOKEN_FILE), { recursive: true });
  await fs.writeFile(TOKEN_FILE, JSON.stringify(t), { mode: 0o600 });
}
