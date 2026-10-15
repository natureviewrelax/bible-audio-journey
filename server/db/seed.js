import fs from "node:fs";
import path from "node:path";
import { randomUUID, randomBytes } from "node:crypto";
import { ROOT } from "../config.js";
import { hashPw } from "../auth/password.js";

const DIR = path.join(ROOT, "db", "seeds");
const q = (c) => `"${c}"`;

// Seeds idempotentes: só insere o que ainda não existe (pela chave natural de cada tabela).
export function seed(db, log = console.log) {
  const manifest = JSON.parse(fs.readFileSync(path.join(DIR, "index.json"), "utf8"));
  const stats = {};

  for (const { table, file, key } of manifest) {
    const rows = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
    const cols = db.prepare(`PRAGMA table_info(${q(table)})`).all().map((c) => c.name);
    let added = 0;
    for (const row of rows) {
      for (const c of [...Object.keys(row), ...key]) {
        if (!cols.includes(c)) throw new Error(`Seed ${file}: coluna inexistente "${c}" em ${table}`);
      }
      const exists = db
        .prepare(`SELECT 1 FROM ${q(table)} WHERE ${key.map((k) => `${q(k)} = ?`).join(" AND ")}`)
        .get(...key.map((k) => row[k] ?? null));
      if (exists) continue;
      const data = { ...row };
      if (cols.includes("id") && data.id === undefined) data.id = randomUUID();
      const names = Object.keys(data);
      db.prepare(`INSERT INTO ${q(table)} (${names.map(q).join(",")}) VALUES (${names.map(() => "?").join(",")})`)
        .run(...names.map((n) => data[n] ?? null));
      added++;
    }
    stats[table] = added;
    log(`[seed] ${table}: ${added} novo(s) de ${rows.length}`);
  }

  // Usuário administrador inicial (o papel "admin" vem do e-mail conter "admin")
  const email = (process.env.ADMIN_EMAIL || "admin@bible.local").toLowerCase();
  if (!db.prepare("SELECT 1 FROM users WHERE email=?").get(email)) {
    const password = process.env.ADMIN_PASSWORD || randomBytes(9).toString("base64url");
    db.prepare("INSERT INTO users (id,email,password_hash) VALUES (?,?,?)").run(randomUUID(), email, hashPw(password));
    log(`[seed] admin criado: ${email}` + (process.env.ADMIN_PASSWORD ? "" : ` / senha gerada: ${password}`));
    stats.users = 1;
  }
  return stats;
}
