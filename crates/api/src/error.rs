use axum::extract::rejection::JsonRejection;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use bible_db::DbError;
use serde_json::json;

/// Erros devolvidos como `{ "error": { "message": "..." } }`, o formato que o frontend espera.
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
  #[error("{0}")]
  BadRequest(String),
  #[error("{0}")]
  Unauthorized(String),
  #[error("{0}")]
  NotFound(String),
  #[error("{0}")]
  Conflict(String),
  #[error("{0}")]
  Internal(String),
}

impl From<DbError> for ApiError {
  fn from(e: DbError) -> Self {
    match e {
      DbError::Invalid(_) | DbError::Sqlite(_) => Self::BadRequest(e.to_string()),
      other => Self::Internal(other.to_string()),
    }
  }
}

impl From<JsonRejection> for ApiError {
  fn from(e: JsonRejection) -> Self {
    Self::BadRequest(format!("Corpo JSON inválido: {e}"))
  }
}

impl IntoResponse for ApiError {
  fn into_response(self) -> Response {
    let (status, message) = match self {
      Self::BadRequest(m) => (StatusCode::BAD_REQUEST, m),
      Self::Unauthorized(m) => (StatusCode::UNAUTHORIZED, m),
      Self::NotFound(m) => (StatusCode::NOT_FOUND, m),
      Self::Conflict(m) => (StatusCode::CONFLICT, m),
      Self::Internal(m) => {
        tracing::error!("erro interno: {m}");
        (StatusCode::INTERNAL_SERVER_ERROR, "Erro interno do servidor".to_string())
      }
    };
    (status, Json(json!({ "error": { "message": message } }))).into_response()
  }
}

/// Extrator JSON cuja rejeição usa o formato de erro da API.
#[derive(axum::extract::FromRequest)]
#[from_request(via(axum::Json), rejection(ApiError))]
pub struct ApiJson<T>(pub T);
