use std::fs;
use std::path::Path;
use std::sync::{Arc, Mutex};

use bible_core::config::Config;
use bible_db::{connection, migrate, seed, Connection, DbError};
use jsonwebtoken::{DecodingKey, EncodingKey};
use rand::RngCore;

use crate::error::ApiError;

#[derive(Clone)]
pub struct AppState {
  db: Arc<Mutex<Connection>>,
  pub config: Arc<Config>,
  pub(crate) enc: Arc<EncodingKey>,
  pub(crate) dec: Arc<DecodingKey>,
}

impl AppState {
  /// Abre o banco, aplica migrations, popula seeds (se habilitado) e prepara diretórios e segredo JWT.
  pub fn new(config: Config) -> Result<Self, DbError> {
    fs::create_dir_all(&config.upload_dir)?;
    let conn = connection::open(&config.db_file)?;
    migrate::migrate(&conn)?;
    if config.seed_on_start {
      seed::seed(&conn, &config)?;
    }
    let secret = jwt_secret(&config)?;
    Ok(Self::from_parts(conn, config, &secret))
  }

  pub fn from_parts(conn: Connection, config: Config, secret: &str) -> Self {
    Self {
      db: Arc::new(Mutex::new(conn)),
      config: Arc::new(config),
      enc: Arc::new(EncodingKey::from_secret(secret.as_bytes())),
      dec: Arc::new(DecodingKey::from_secret(secret.as_bytes())),
    }
  }

  /// Executa `f` com a conexão. Um mutex envenenado ainda é utilizável: a conexão em si continua íntegra.
  pub fn with_db<T>(&self, f: impl FnOnce(&Connection) -> Result<T, DbError>) -> Result<T, ApiError> {
    let guard = self.db.lock().unwrap_or_else(|e| e.into_inner());
    Ok(f(&guard)?)
  }
}

fn jwt_secret(config: &Config) -> Result<String, DbError> {
  if let Some(s) = &config.jwt_secret {
    return Ok(s.clone());
  }
  let file = config.db_file.parent().unwrap_or(Path::new(".")).join(".jwt-secret");
  if let Ok(s) = fs::read_to_string(&file) {
    if !s.trim().is_empty() {
      return Ok(s.trim().to_string());
    }
  }
  let mut bytes = [0u8; 32];
  rand::thread_rng().fill_bytes(&mut bytes);
  let secret = hex::encode(bytes);
  fs::write(&file, &secret)?;
  Ok(secret)
}

/// Roda trabalho bloqueante/CPU-bound (scrypt) fora das threads async.
pub async fn blocking<T: Send + 'static>(f: impl FnOnce() -> T + Send + 'static) -> Result<T, ApiError> {
  tokio::task::spawn_blocking(f).await.map_err(|e| ApiError::Internal(e.to_string()))
}
