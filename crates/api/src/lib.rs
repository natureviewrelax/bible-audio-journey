//! L2: rotas HTTP. Contrato idêntico ao da API Node anterior (`/api/auth/*`, `/api/db/:table`, `/api/storage/upload`, `/uploads`).
#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic, clippy::unimplemented, clippy::todo, clippy::unreachable)]

mod auth;
mod data;
mod error;
mod state;
mod storage;

use std::net::SocketAddr;

use axum::extract::DefaultBodyLimit;
use axum::routing::{any, get, post};
use axum::Router;
use tower_http::cors::CorsLayer;
use tower_http::services::{ServeDir, ServeFile};
use tower_http::trace::TraceLayer;

pub use error::ApiError;
pub use state::AppState;

async fn api_not_found() -> ApiError {
  ApiError::NotFound("Rota não encontrada".into())
}

pub fn router(state: AppState) -> Router {
  let json_limit = DefaultBodyLimit::max(1024 * 1024);
  let mut app = Router::new()
    .route("/api/auth/signup", post(auth::signup).layer(json_limit))
    .route("/api/auth/login", post(auth::login).layer(json_limit))
    .route("/api/auth/me", get(auth::me))
    .route("/api/db/:table", post(data::run).layer(json_limit))
    .route("/api/storage/upload", post(storage::upload).layer(DefaultBodyLimit::max(storage::MAX_UPLOAD_BYTES + 1024 * 1024)))
    .route("/api/*rest", any(api_not_found))
    .nest_service("/uploads", ServeDir::new(&state.config.upload_dir));

  // Frontend compilado (imagem Docker): serve o app e faz fallback de SPA.
  let dist = &state.config.dist_dir;
  if dist.is_dir() {
    app = app.fallback_service(ServeDir::new(dist).fallback(ServeFile::new(dist.join("index.html"))));
  }
  app.layer(CorsLayer::permissive()).layer(TraceLayer::new_for_http()).with_state(state)
}

pub async fn serve(state: AppState) -> std::io::Result<()> {
  let addr = SocketAddr::from(([0, 0, 0, 0], state.config.port));
  let listener = tokio::net::TcpListener::bind(addr).await?;
  tracing::info!("API em http://localhost:{} (banco: {})", state.config.port, state.config.db_file.display());
  axum::serve(listener, router(state)).with_graceful_shutdown(shutdown_signal()).await
}

async fn shutdown_signal() {
  let ctrl_c = async {
    let _ = tokio::signal::ctrl_c().await;
  };
  #[cfg(unix)]
  let term = async {
    if let Ok(mut s) = tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
      s.recv().await;
    }
  };
  #[cfg(not(unix))]
  let term = std::future::pending::<()>();
  tokio::select! { _ = ctrl_c => {}, _ = term => {} }
}

#[cfg(test)]
mod tests;
