use axum::extract::{Path, State};
use axum::http::HeaderMap;
use axum::Json;
use bible_core::tables;
use bible_db::query::{self, DataRequest, Op};
use serde_json::{json, Value};

use crate::auth::authenticate;
use crate::error::{ApiError, ApiJson};
use crate::state::AppState;

/// `POST /api/db/:table` — leitura pública; qualquer escrita exige token.
pub async fn run(
  State(state): State<AppState>,
  Path(table): Path<String>,
  headers: HeaderMap,
  ApiJson(req): ApiJson<DataRequest>,
) -> Result<Json<Value>, ApiError> {
  if req.op != Op::Select {
    authenticate(&state, &headers)?;
  }
  let spec = tables::table(&table).ok_or_else(|| ApiError::NotFound("Tabela desconhecida".into()))?;
  let rows = state.with_db(|conn| query::execute(conn, spec, &req))?;
  Ok(Json(json!({ "data": rows })))
}
