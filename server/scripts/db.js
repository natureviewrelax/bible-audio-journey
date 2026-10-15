// Uso: node server/scripts/db.js <migrate|seed|setup|reset|status>
import fs from "node:fs";
import { DB_FILE } from "../config.js";
import { openDb } from "../db/connection.js";
import { migrate, migrationStatus } from "../db/migrate.js";
import { seed } from "../db/seed.js";

const cmd = process.argv[2];

if (cmd === "reset") {
  if (process.env.CONFIRM_RESET !== "yes") {
    console.error(`reset APAGA o banco ${DB_FILE}. Rode com CONFIRM_RESET=yes para confirmar.`);
    process.exit(1);
  }
  for (const f of [DB_FILE, `${DB_FILE}-wal`, `${DB_FILE}-shm`]) fs.rmSync(f, { force: true });
  const db = openDb();
  migrate(db);
  seed(db);
} else if (cmd === "migrate") {
  migrate(openDb());
} else if (cmd === "seed") {
  const db = openDb();
  migrate(db); // garante o esquema antes de popular
  seed(db);
} else if (cmd === "setup") {
  const db = openDb();
  migrate(db);
  seed(db);
} else if (cmd === "status") {
  migrationStatus(openDb()).forEach((m) => console.log(`${m.applied ? "[x]" : "[ ]"} ${m.name}`));
} else {
  console.error("Uso: node server/scripts/db.js <migrate|seed|setup|reset|status>");
  process.exit(1);
}
