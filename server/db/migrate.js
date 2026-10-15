import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../config.js";

const DIR = path.join(ROOT, "db", "migrations");
const listFiles = () => fs.readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();

// Aplica, em ordem de nome (001_, 002_, ...), cada .sql ainda não registrado em schema_migrations.
export function migrate(db, log = console.log) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )`);
  const done = new Set(db.prepare("SELECT name FROM schema_migrations").all().map((r) => r.name));
  const applied = [];
  for (const file of listFiles()) {
    if (done.has(file)) continue;
    db.exec("BEGIN");
    try {
      db.exec(fs.readFileSync(path.join(DIR, file), "utf8"));
      db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run(file);
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw new Error(`Falha na migration ${file}: ${e.message}`);
    }
    log(`[migrate] aplicada ${file}`);
    applied.push(file);
  }
  return applied;
}

export function migrationStatus(db) {
  let done = new Set();
  try {
    done = new Set(db.prepare("SELECT name FROM schema_migrations").all().map((r) => r.name));
  } catch {
    // tabela de controle ainda não existe
  }
  return listFiles().map((name) => ({ name, applied: done.has(name) }));
}
