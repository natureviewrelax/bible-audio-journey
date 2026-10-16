use rand::RngCore;
use rusqlite::{Connection, OptionalExtension, Row};

use crate::DbError;

#[derive(Debug, Clone)]
pub struct User {
  pub id: String,
  pub email: String,
  pub password_hash: String,
  pub created_at: String,
}

fn map(r: &Row<'_>) -> rusqlite::Result<User> {
  Ok(User { id: r.get("id")?, email: r.get("email")?, password_hash: r.get("password_hash")?, created_at: r.get("created_at")? })
}

pub fn find_by_email(conn: &Connection, email: &str) -> Result<Option<User>, DbError> {
  Ok(conn.query_row("SELECT * FROM users WHERE email = ?1", [email], map).optional()?)
}

pub fn find_by_id(conn: &Connection, id: &str) -> Result<Option<User>, DbError> {
  Ok(conn.query_row("SELECT * FROM users WHERE id = ?1", [id], map).optional()?)
}

pub fn create(conn: &Connection, email: &str, password_hash: &str) -> Result<User, DbError> {
  let id = uuid::Uuid::new_v4().to_string();
  conn.execute("INSERT INTO users (id, email, password_hash) VALUES (?1, ?2, ?3)", [&id, email, password_hash])?;
  find_by_id(conn, &id)?.ok_or_else(|| DbError::invalid("Usuário não encontrado após criação"))
}

/// Gera uma senha aleatória legível para o admin inicial.
pub fn random_password() -> String {
  let mut bytes = [0u8; 9];
  rand::thread_rng().fill_bytes(&mut bytes);
  hex::encode(bytes)
}
