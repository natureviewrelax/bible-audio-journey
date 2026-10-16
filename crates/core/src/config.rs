use std::env;
use std::path::PathBuf;

/// Configuração lida do ambiente. Os nomes e padrões são os mesmos da API Node anterior.
#[derive(Debug, Clone)]
pub struct Config {
  pub port: u16,
  pub db_file: PathBuf,
  pub upload_dir: PathBuf,
  pub dist_dir: PathBuf,
  pub seed_on_start: bool,
  pub jwt_secret: Option<String>,
  pub admin_email: String,
  pub admin_password: Option<String>,
}

impl Config {
  pub fn from_env() -> Self {
    let path = |key: &str, default: &str| PathBuf::from(env::var(key).unwrap_or_else(|_| default.to_string()));
    Self {
      port: env::var("API_PORT").ok().and_then(|v| v.parse().ok()).unwrap_or(3001),
      db_file: path("DB_FILE", "server/data/bible.db"),
      upload_dir: path("UPLOAD_DIR", "server/uploads"),
      dist_dir: path("DIST_DIR", "dist"),
      seed_on_start: env::var("SEED_ON_START").map(|v| v != "false").unwrap_or(true),
      jwt_secret: env::var("JWT_SECRET").ok().filter(|v| !v.is_empty()),
      admin_email: env::var("ADMIN_EMAIL").unwrap_or_else(|_| "admin@bible.local".into()).to_lowercase(),
      admin_password: env::var("ADMIN_PASSWORD").ok().filter(|v| !v.is_empty()),
    }
  }
}
