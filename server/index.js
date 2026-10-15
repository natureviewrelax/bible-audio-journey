import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import multer from "multer";
import { DatabaseSync } from "node:sqlite";
import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.API_PORT || 3001;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, "data", "bible.db");
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
const SECRET_FILE = path.join(path.dirname(DB_FILE), ".jwt-secret");

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

if (!process.env.JWT_SECRET && !fs.existsSync(SECRET_FILE)) {
  fs.writeFileSync(SECRET_FILE, randomBytes(32).toString("hex"));
}
const JWT_SECRET = process.env.JWT_SECRET || fs.readFileSync(SECRET_FILE, "utf8");

const db = new DatabaseSync(DB_FILE);
db.exec(`
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS audio_authors (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  ministry_role TEXT, biography TEXT, email TEXT, phone TEXT,
  website TEXT, facebook TEXT, youtube TEXT, instagram TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS verse_audio (
  id TEXT PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  audio_path TEXT NOT NULL,
  author_id TEXT REFERENCES audio_authors(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (book, chapter, verse, author_id)
);
CREATE TABLE IF NOT EXISTS audio_settings (
  id INTEGER PRIMARY KEY,
  use_default_audio INTEGER NOT NULL DEFAULT 1,
  default_audio_source TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_by TEXT
);
CREATE TABLE IF NOT EXISTS bible_videos (
  id TEXT PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
`);

// Tabelas expostas, colunas permitidas, PK e colunas booleanas
const TABLES = {
  audio_authors: {
    pk: "id", uuid: true,
    cols: ["id", "first_name", "last_name", "ministry_role", "biography", "email", "phone", "website", "facebook", "youtube", "instagram", "created_at"],
  },
  verse_audio: {
    pk: "id", uuid: true,
    cols: ["id", "book", "chapter", "verse", "audio_path", "author_id", "created_at"],
    conflict: ["book", "chapter", "verse", "author_id"],
  },
  audio_settings: {
    pk: "id", uuid: false,
    cols: ["id", "use_default_audio", "default_audio_source", "updated_at", "updated_by"],
    bool: ["use_default_audio"],
  },
  bible_videos: {
    pk: "id", uuid: true,
    cols: ["id", "youtube_id", "title", "description", "created_at", "updated_at"],
  },
};
const OPS = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=" };

const q = (c) => `"${c}"`;
const fromDb = (t, row) => {
  if (!row) return row;
  const out = { ...row };
  for (const c of TABLES[t].bool || []) if (c in out) out[c] = !!out[c];
  return out;
};
const toDb = (t, v) => (typeof v === "boolean" ? (v ? 1 : 0) : v === undefined ? null : v);

function where(t, filters = []) {
  const cfg = TABLES[t];
  const parts = [];
  const params = [];
  for (const [col, op, val] of filters) {
    if (!cfg.cols.includes(col)) throw new Error(`Coluna inválida: ${col}`);
    if (op === "is") { parts.push(`${q(col)} IS NULL`); continue; }
    if (!OPS[op]) throw new Error(`Operador inválido: ${op}`);
    if (val === null) { parts.push(op === "neq" ? `${q(col)} IS NOT NULL` : `${q(col)} IS NULL`); continue; }
    parts.push(`${q(col)} ${OPS[op]} ?`);
    params.push(toDb(t, val));
  }
  return { sql: parts.length ? ` WHERE ${parts.join(" AND ")}` : "", params };
}

function cleanRow(t, row) {
  const cfg = TABLES[t];
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (!cfg.cols.includes(k)) throw new Error(`Coluna inválida: ${k}`);
    out[k] = toDb(t, v);
  }
  return out;
}

function insertRow(t, row, upsert) {
  const cfg = TABLES[t];
  const r = cleanRow(t, row);
  if (cfg.uuid && !r[cfg.pk]) r[cfg.pk] = randomUUID();
  const cols = Object.keys(r);
  let sql = `INSERT INTO ${q(t)} (${cols.map(q).join(",")}) VALUES (${cols.map(() => "?").join(",")})`;
  if (upsert) {
    // upsert pela PK; para verse_audio, pela chave natural (livro/capítulo/versículo/autor)
    let target = [cfg.pk];
    if (cfg.conflict && !r[cfg.pk]) target = cfg.conflict;
    if (cfg.conflict && r.author_id === null) {
      // UNIQUE com NULL não conflita no SQLite: substitui manualmente
      db.prepare(`DELETE FROM verse_audio WHERE book=? AND chapter=? AND verse=? AND author_id IS NULL`).run(r.book, r.chapter, r.verse);
    }
    const upd = cols.filter((c) => !target.includes(c));
    sql += ` ON CONFLICT (${target.map(q).join(",")}) DO ` + (upd.length ? `UPDATE SET ${upd.map((c) => `${q(c)}=excluded.${q(c)}`).join(",")}` : "NOTHING");
  }
  db.prepare(sql).run(...cols.map((c) => r[c]));
  return db.prepare(`SELECT * FROM ${q(t)} WHERE ${q(cfg.pk)} = ?`).get(r[cfg.pk]) ??
    (cfg.conflict ? db.prepare(`SELECT * FROM ${q(t)} WHERE book=? AND chapter=? AND verse=? AND author_id IS ?`).get(r.book, r.chapter, r.verse, r.author_id ?? null) : null);
}

// ---------- auth ----------
const hashPw = (pw) => {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`;
};
const checkPw = (pw, stored) => {
  const [salt, hash] = stored.split(":");
  const h = scryptSync(pw, Buffer.from(salt, "hex"), 64);
  return timingSafeEqual(h, Buffer.from(hash, "hex"));
};
const sign = (u) => jwt.sign({ sub: u.id, email: u.email }, JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u.id, email: u.email, created_at: u.created_at });

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  try {
    const p = jwt.verify(h.replace(/^Bearer /, ""), JWT_SECRET);
    req.user = { id: p.sub, email: p.email };
    next();
  } catch {
    res.status(401).json({ error: { message: "Não autenticado" } });
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));

app.post("/api/auth/signup", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 6)
    return res.status(400).json({ error: { message: "Email e senha (mín. 6 caracteres) são obrigatórios" } });
  const mail = String(email).trim().toLowerCase();
  if (db.prepare("SELECT 1 FROM users WHERE email=?").get(mail))
    return res.status(409).json({ error: { message: "Usuário já cadastrado" } });
  const id = randomUUID();
  db.prepare("INSERT INTO users (id,email,password_hash) VALUES (?,?,?)").run(id, mail, hashPw(password));
  const u = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  res.json({ token: sign(u), user: publicUser(u) });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(String(email || "").trim().toLowerCase());
  if (!u || !checkPw(String(password || ""), u.password_hash))
    return res.status(401).json({ error: { message: "Email ou senha inválidos" } });
  res.json({ token: sign(u), user: publicUser(u) });
});

app.get("/api/auth/me", auth, (req, res) => {
  const u = db.prepare("SELECT * FROM users WHERE id=?").get(req.user.id);
  if (!u) return res.status(401).json({ error: { message: "Usuário não encontrado" } });
  res.json({ user: publicUser(u) });
});

// ---------- dados ----------
// body: { op, filters, values, order, limit, single }
app.post("/api/db/:table", (req, res, next) => {
  if ((req.body?.op || "select") === "select") return next();
  return auth(req, res, next);
}, (req, res) => {
  const t = req.params.table;
  if (!TABLES[t]) return res.status(404).json({ error: { message: "Tabela desconhecida" } });
  const { op = "select", filters = [], values, order, limit } = req.body || {};
  const cfg = TABLES[t];
  try {
    if (op === "select") {
      const w = where(t, filters);
      let sql = `SELECT * FROM ${q(t)}${w.sql}`;
      if (order?.length) {
        sql += " ORDER BY " + order.map(([c, asc]) => {
          if (!cfg.cols.includes(c)) throw new Error(`Coluna inválida: ${c}`);
          return `${q(c)} ${asc === false ? "DESC" : "ASC"}`;
        }).join(",");
      }
      if (limit) sql += ` LIMIT ${Number(limit) | 0}`;
      return res.json({ data: db.prepare(sql).all(...w.params).map((r) => fromDb(t, r)) });
    }
    if (op === "insert" || op === "upsert") {
      const rows = (Array.isArray(values) ? values : [values]).map((v) => fromDb(t, insertRow(t, v, op === "upsert")));
      return res.json({ data: rows });
    }
    if (op === "update") {
      const r = cleanRow(t, values || {});
      if ("updated_at" in cfg.cols.reduce((a, c) => ({ ...a, [c]: 1 }), {}) && !("updated_at" in r) && t === "bible_videos")
        r.updated_at = new Date().toISOString();
      const cols = Object.keys(r);
      if (!cols.length) return res.json({ data: [] });
      const w = where(t, filters);
      db.prepare(`UPDATE ${q(t)} SET ${cols.map((c) => `${q(c)}=?`).join(",")}${w.sql}`).run(...cols.map((c) => r[c]), ...w.params);
      return res.json({ data: db.prepare(`SELECT * FROM ${q(t)}${w.sql}`).all(...w.params).map((x) => fromDb(t, x)) });
    }
    if (op === "delete") {
      const w = where(t, filters);
      db.prepare(`DELETE FROM ${q(t)}${w.sql}`).run(...w.params);
      return res.json({ data: [] });
    }
    res.status(400).json({ error: { message: "Operação inválida" } });
  } catch (e) {
    res.status(400).json({ error: { message: e.message } });
  }
});

// ---------- armazenamento de áudio ----------
const upload = multer({ dest: path.join(UPLOAD_DIR, ".tmp"), limits: { fileSize: 200 * 1024 * 1024 } });
app.post("/api/storage/upload", auth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: "Arquivo ausente" } });
  const name = path.basename(String(req.body.path || req.file.originalname)).replace(/[^\w.\-]/g, "_");
  fs.renameSync(req.file.path, path.join(UPLOAD_DIR, name));
  res.json({ path: name, url: `/uploads/${name}` });
});

app.listen(PORT, () => console.log(`API em http://localhost:${PORT} (banco: ${DB_FILE})`));
