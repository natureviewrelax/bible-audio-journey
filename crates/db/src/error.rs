#[derive(Debug, thiserror::Error)]
pub enum DbError {
  /// Entrada do cliente inválida (coluna, operador, valor...).
  #[error("{0}")]
  Invalid(String),
  #[error("{0}")]
  Sqlite(#[from] rusqlite::Error),
  #[error("{0}")]
  Io(#[from] std::io::Error),
  #[error("{0}")]
  Json(#[from] serde_json::Error),
  #[error("Falha na migration {name}: {source}")]
  Migration { name: String, source: rusqlite::Error },
  #[error("{0}")]
  Password(#[from] bible_core::password::PasswordError),
}

impl DbError {
  pub fn invalid(msg: impl Into<String>) -> Self {
    Self::Invalid(msg.into())
  }

  /// Violação de UNIQUE (ex.: e-mail duplicado).
  pub fn is_unique_violation(&self) -> bool {
    matches!(self, Self::Sqlite(rusqlite::Error::SqliteFailure(e, _)) if e.code == rusqlite::ErrorCode::ConstraintViolation)
  }
}
