use std::path::Path;

use axum::extract::{Multipart, State};
use axum::http::HeaderMap;
use axum::Json;
use serde_json::{json, Value};
use tokio::fs;
use tokio::io::AsyncWriteExt;

use crate::auth::authenticate;
use crate::error::ApiError;
use crate::state::AppState;

pub const MAX_UPLOAD_BYTES: usize = 200 * 1024 * 1024;

/// Último segmento do caminho, com tudo fora de `[A-Za-z0-9_.-]` trocado por `_`. Recusa nomes vazios ou ocultos/relativos.
fn sanitize(raw: &str) -> Option<String> {
  let base = raw.rsplit(['/', '\\']).next().unwrap_or_default();
  let name: String = base.chars().map(|c| if c.is_ascii_alphanumeric() || matches!(c, '_' | '.' | '-') { c } else { '_' }).collect();
  (!name.is_empty() && !name.starts_with('.')).then_some(name)
}

fn bad(e: impl std::fmt::Display) -> ApiError {
  ApiError::BadRequest(format!("Upload inválido: {e}"))
}

/// `POST /api/storage/upload` (multipart: `path` opcional + `file`).
pub async fn upload(State(state): State<AppState>, headers: HeaderMap, mut form: Multipart) -> Result<Json<Value>, ApiError> {
  authenticate(&state, &headers)?;
  let tmp_dir = state.config.upload_dir.join(".tmp");
  fs::create_dir_all(&tmp_dir).await.map_err(|e| ApiError::Internal(e.to_string()))?;

  let mut wanted: Option<String> = None;
  let mut original: Option<String> = None;
  let mut tmp: Option<std::path::PathBuf> = None;

  let result = async {
    while let Some(mut field) = form.next_field().await.map_err(bad)? {
      match field.name() {
        Some("path") => wanted = Some(field.text().await.map_err(bad)?),
        Some("file") => {
          original = field.file_name().map(str::to_string);
          let path = tmp_dir.join(uuid::Uuid::new_v4().to_string());
          let mut out = fs::File::create(&path).await.map_err(|e| ApiError::Internal(e.to_string()))?;
          tmp = Some(path);
          let mut size = 0usize;
          while let Some(chunk) = field.chunk().await.map_err(bad)? {
            size += chunk.len();
            if size > MAX_UPLOAD_BYTES {
              return Err(ApiError::BadRequest("Arquivo maior que 200 MB".into()));
            }
            out.write_all(&chunk).await.map_err(|e| ApiError::Internal(e.to_string()))?;
          }
          out.flush().await.map_err(|e| ApiError::Internal(e.to_string()))?;
        }
        _ => {}
      }
    }
    let tmp_path = tmp.clone().ok_or_else(|| ApiError::BadRequest("Arquivo ausente".into()))?;
    let name = wanted
      .filter(|w| !w.is_empty())
      .or(original)
      .and_then(|n| sanitize(&n))
      .ok_or_else(|| ApiError::BadRequest("Nome de arquivo inválido".into()))?;
    fs::rename(&tmp_path, Path::new(&state.config.upload_dir).join(&name)).await.map_err(|e| ApiError::Internal(e.to_string()))?;
    Ok(name)
  }
  .await;

  if result.is_err() {
    if let Some(p) = &tmp {
      let _ = fs::remove_file(p).await;
    }
  }
  let name = result?;
  Ok(Json(json!({ "path": name, "url": format!("/uploads/{name}") })))
}

#[cfg(test)]
mod tests {
  use super::sanitize;

  #[test]
  fn sanitize_blocks_traversal() {
    assert_eq!(sanitize("../../etc/passwd").as_deref(), Some("passwd"));
    assert_eq!(sanitize("..\\x.mp3").as_deref(), Some("x.mp3"));
    assert_eq!(sanitize("..").as_deref(), None);
    assert_eq!(sanitize("a b é.mp3").as_deref(), Some("a_b__.mp3"));
    assert_eq!(sanitize("").as_deref(), None);
  }
}
