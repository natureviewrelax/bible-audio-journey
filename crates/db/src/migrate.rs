//! Aplica, em ordem de nome (001_, 002_, ...), cada `.sql` de `migrations/` ainda não registrado em `schema_migrations`.
use std::collections::HashSet;

use include_dir::{include_dir, Dir};
use rusqlite::Connection;

use crate::DbError;

static MIGRATIONS: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/migrations");

fn files() -> Vec<(&'static str, &'static str)> {
  let mut out: Vec<_> = MIGRATIONS
    .files()
    .filter_map(|f| Some((f.path().file_name()?.to_str()?, f.contents_utf8()?)))
    .filter(|(name, _)| name.ends_with(".sql"))
    .collect();
  out.sort_by_key(|(name, _)| *name);
  out
}

const CREATE_TRACKING: &str = "CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
)";

fn applied(conn: &Connection) -> Result<HashSet<String>, DbError> {
  let mut stmt = conn.prepare("SELECT name FROM schema_migrations")?;
  let names = stmt.query_map([], |r| r.get::<_, String>(0))?.collect::<Result<_, _>>()?;
  Ok(names)
}

pub fn migrate(conn: &Connection) -> Result<Vec<String>, DbError> {
  conn.execute_batch(CREATE_TRACKING)?;
  let done = applied(conn)?;
  let mut newly = Vec::new();
  for (name, sql) in files() {
    if done.contains(name) {
      continue;
    }
    let run = || -> Result<(), rusqlite::Error> {
      let tx = conn.unchecked_transaction()?;
      tx.execute_batch(sql)?;
      tx.execute("INSERT INTO schema_migrations (name) VALUES (?1)", [name])?;
      tx.commit()
    };
    run().map_err(|source| DbError::Migration { name: name.to_string(), source })?;
    tracing::info!("[migrate] aplicada {name}");
    newly.push(name.to_string());
  }
  Ok(newly)
}

pub fn status(conn: &Connection) -> Result<Vec<(String, bool)>, DbError> {
  // A tabela de controle pode ainda não existir.
  let done = applied(conn).unwrap_or_default();
  Ok(files().into_iter().map(|(name, _)| (name.to_string(), done.contains(name))).collect())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn migrate_is_idempotent() {
    let conn = Connection::open_in_memory().unwrap();
    assert!(!migrate(&conn).unwrap().is_empty());
    assert!(migrate(&conn).unwrap().is_empty());
    assert!(status(&conn).unwrap().iter().all(|(_, ok)| *ok));
  }
}
