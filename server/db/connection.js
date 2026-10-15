import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DB_FILE } from "../config.js";

export function openDb(file = DB_FILE) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}
