import { randomUUID, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dados iniciais idempotentes: só insere o que ainda não existe.
// Edite server/seed.json para incluir autores e vídeos iniciais.
export function seed(db, hashPw) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "seed.json"), "utf8"));

  const authorIds = {};
  for (const a of data.audio_authors) {
    const found = db.prepare("SELECT id FROM audio_authors WHERE first_name=? AND last_name=?").get(a.first_name, a.last_name);
    if (found) { authorIds[`${a.first_name} ${a.last_name}`] = found.id; continue; }
    const id = randomUUID();
    db.prepare(
      `INSERT INTO audio_authors (id, first_name, last_name, ministry_role, biography, email, phone, website, facebook, youtube, instagram)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(id, a.first_name, a.last_name, a.ministry_role ?? null, a.biography ?? null, a.email ?? null, a.phone ?? null,
      a.website ?? null, a.facebook ?? null, a.youtube ?? null, a.instagram ?? null);
    authorIds[`${a.first_name} ${a.last_name}`] = id;
  }

  for (const v of data.bible_videos) {
    if (db.prepare("SELECT 1 FROM bible_videos WHERE youtube_id=?").get(v.youtube_id)) continue;
    db.prepare("INSERT INTO bible_videos (id, youtube_id, title, description) VALUES (?,?,?,?)")
      .run(randomUUID(), v.youtube_id, v.title, v.description);
  }

  // Usuário administrador inicial (o papel "admin" vem de o e-mail conter "admin")
  const email = (process.env.ADMIN_EMAIL || "admin@bible.local").toLowerCase();
  if (!db.prepare("SELECT 1 FROM users WHERE email=?").get(email)) {
    const password = process.env.ADMIN_PASSWORD || randomBytes(9).toString("base64url");
    db.prepare("INSERT INTO users (id,email,password_hash) VALUES (?,?,?)").run(randomUUID(), email, hashPw(password));
    console.log(`[seed] admin criado: ${email}` + (process.env.ADMIN_PASSWORD ? "" : ` / senha gerada: ${password}`));
  }
}
