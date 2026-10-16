//! Seeds idempotentes: só insere o que ainda não existe (pela chave natural de cada tabela).
use include_dir::{include_dir, Dir};
use rusqlite::{params_from_iter, Connection};
use serde::Deserialize;
use serde_json::Value;

use crate::query::to_sql;
use crate::{users, DbError};
use bible_core::config::Config;
use bible_core::password::hash_password;

static SEEDS: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/seeds");

#[derive(Debug, Deserialize)]
struct ManifestEntry {
  table: String,
  file: String,
  key: Vec<String>,
}

fn q(c: &str) -> String {
  format!("\"{c}\"")
}

fn read(name: &str) -> Result<&'static str, DbError> {
  SEEDS.get_file(name).and_then(|f| f.contents_utf8()).ok_or_else(|| DbError::invalid(format!("Seed ausente: {name}")))
}

fn table_columns(conn: &Connection, table: &str) -> Result<Vec<String>, DbError> {
  let mut stmt = conn.prepare(&format!("PRAGMA table_info({})", q(table)))?;
  let cols = stmt.query_map([], |r| r.get::<_, String>(1))?.collect::<Result<_, _>>()?;
  Ok(cols)
}

/// Retorna `(tabela, novos)` por entrada do manifesto.
pub fn seed(conn: &Connection, config: &Config) -> Result<Vec<(String, usize)>, DbError> {
  let manifest: Vec<ManifestEntry> = serde_json::from_str(read("index.json")?)?;
  let mut stats = Vec::new();

  for ManifestEntry { table, file, key } in manifest {
    let rows: Vec<serde_json::Map<String, Value>> = serde_json::from_str(read(&file)?)?;
    let cols = table_columns(conn, &table)?;
    let tx = conn.unchecked_transaction()?;
    let mut added = 0;
    for row in &rows {
      for c in row.keys().chain(key.iter()) {
        if !cols.contains(c) {
          return Err(DbError::invalid(format!("Seed {file}: coluna inexistente \"{c}\" em {table}")));
        }
      }
      let key_params = key.iter().map(|k| to_sql(row.get(k).unwrap_or(&Value::Null))).collect::<Result<Vec<_>, _>>()?;
      let cond = key.iter().map(|k| format!("{} IS ?", q(k))).collect::<Vec<_>>().join(" AND ");
      let exists = tx.query_row(&format!("SELECT EXISTS(SELECT 1 FROM {} WHERE {cond})", q(&table)), params_from_iter(key_params.iter()), |r| {
        r.get::<_, bool>(0)
      })?;
      if exists {
        continue;
      }
      let mut data = row.clone();
      if cols.iter().any(|c| c == "id") && !data.contains_key("id") {
        data.insert("id".into(), Value::String(uuid::Uuid::new_v4().to_string()));
      }
      let names: Vec<&String> = data.keys().collect();
      let params = data.values().map(to_sql).collect::<Result<Vec<_>, _>>()?;
      tx.execute(
        &format!(
          "INSERT INTO {} ({}) VALUES ({})",
          q(&table),
          names.iter().map(|n| q(n)).collect::<Vec<_>>().join(","),
          vec!["?"; names.len()].join(",")
        ),
        params_from_iter(params.iter()),
      )?;
      added += 1;
    }
    tx.commit()?;
    tracing::info!("[seed] {table}: {added} novo(s) de {}", rows.len());
    stats.push((table, added));
  }

  // Usuário administrador inicial (o papel "admin" vem do e-mail conter "admin").
  if users::find_by_email(conn, &config.admin_email)?.is_none() {
    let generated = config.admin_password.is_none();
    let password = config.admin_password.clone().unwrap_or_else(users::random_password);
    users::create(conn, &config.admin_email, &hash_password(&password)?)?;
    if generated {
      tracing::info!("[seed] admin criado: {} / senha gerada: {password}", config.admin_email);
    } else {
      tracing::info!("[seed] admin criado: {}", config.admin_email);
    }
    stats.push(("users".into(), 1));
  }
  Ok(stats)
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::migrate::migrate;

  #[test]
  fn seed_is_idempotent() {
    let conn = Connection::open_in_memory().unwrap();
    migrate(&conn).unwrap();
    let config = Config::from_env();
    assert!(seed(&conn, &config).unwrap().iter().any(|(_, n)| *n > 0));
    assert!(seed(&conn, &config).unwrap().iter().all(|(_, n)| *n == 0));
  }
}
