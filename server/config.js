import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

export const ROOT = path.dirname(fileURLToPath(import.meta.url));

export const PORT = process.env.API_PORT || 3001;
export const DB_FILE = process.env.DB_FILE || path.join(ROOT, "data", "bible.db");
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(ROOT, "uploads");
export const DIST_DIR = process.env.DIST_DIR || path.join(ROOT, "..", "dist");
// Popular dados iniciais ao subir a API (desligue com SEED_ON_START=false)
export const SEED_ON_START = process.env.SEED_ON_START !== "false";

export function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = path.join(path.dirname(DB_FILE), ".jwt-secret");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, randomBytes(32).toString("hex"));
  return fs.readFileSync(file, "utf8");
}
