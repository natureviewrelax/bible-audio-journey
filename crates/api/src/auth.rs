use std::time::{SystemTime, UNIX_EPOCH};

use axum::extract::State;
use axum::http::{header::AUTHORIZATION, HeaderMap};
use axum::Json;
use bible_core::password::{check_password, hash_password};
use bible_db::users::{self, User};
use jsonwebtoken::{decode, encode, Header, Validation};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::error::{ApiError, ApiJson};
use crate::state::{blocking, AppState};

const TOKEN_TTL_SECS: u64 = 7 * 24 * 3600;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
  sub: String,
  email: String,
  exp: u64,
}

#[derive(Debug, Clone)]
pub struct AuthUser {
  pub id: String,
}

#[derive(Debug, Default, Deserialize)]
#[serde(default)]
pub struct Credentials {
  email: Option<String>,
  password: Option<String>,
}

fn now_secs() -> u64 {
  SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or_default()
}

fn sign(state: &AppState, user: &User) -> Result<String, ApiError> {
  let claims = Claims { sub: user.id.clone(), email: user.email.clone(), exp: now_secs() + TOKEN_TTL_SECS };
  encode(&Header::default(), &claims, &state.enc).map_err(|e| ApiError::Internal(e.to_string()))
}

fn public_user(u: &User) -> Value {
  json!({ "id": u.id, "email": u.email, "created_at": u.created_at })
}

fn session(state: &AppState, user: &User) -> Result<Json<Value>, ApiError> {
  Ok(Json(json!({ "token": sign(state, user)?, "user": public_user(user) })))
}

/// Valida o `Authorization: Bearer <jwt>`.
pub fn authenticate(state: &AppState, headers: &HeaderMap) -> Result<AuthUser, ApiError> {
  let unauthorized = || ApiError::Unauthorized("Não autenticado".into());
  let raw = headers.get(AUTHORIZATION).and_then(|v| v.to_str().ok()).unwrap_or_default();
  let token = raw.strip_prefix("Bearer ").unwrap_or(raw);
  let data = decode::<Claims>(token, &state.dec, &Validation::default()).map_err(|_| unauthorized())?;
  Ok(AuthUser { id: data.claims.sub })
}

pub async fn signup(State(state): State<AppState>, ApiJson(body): ApiJson<Credentials>) -> Result<Json<Value>, ApiError> {
  let (email, password) = match (body.email, body.password) {
    (Some(e), Some(p)) if !e.trim().is_empty() && p.chars().count() >= 6 => (e.trim().to_lowercase(), p),
    _ => return Err(ApiError::BadRequest("Email e senha (mín. 6 caracteres) são obrigatórios".into())),
  };
  let taken = || ApiError::Conflict("Usuário já cadastrado".into());
  if state.with_db(|c| users::find_by_email(c, &email))?.is_some() {
    return Err(taken());
  }
  let hash = blocking(move || hash_password(&password)).await?.map_err(|e| ApiError::Internal(e.to_string()))?;
  let user = state.with_db(|c| users::create(c, &email, &hash)).map_err(|e| match e {
    ApiError::BadRequest(m) if m.contains("UNIQUE") => taken(),
    other => other,
  })?;
  session(&state, &user)
}

pub async fn login(State(state): State<AppState>, ApiJson(body): ApiJson<Credentials>) -> Result<Json<Value>, ApiError> {
  let invalid = || ApiError::Unauthorized("Email ou senha inválidos".into());
  let email = body.email.unwrap_or_default().trim().to_lowercase();
  let password = body.password.unwrap_or_default();
  let user = state.with_db(|c| users::find_by_email(c, &email))?.ok_or_else(invalid)?;
  let stored = user.password_hash.clone();
  if !blocking(move || check_password(&password, &stored)).await? {
    return Err(invalid());
  }
  session(&state, &user)
}

pub async fn me(State(state): State<AppState>, headers: HeaderMap) -> Result<Json<Value>, ApiError> {
  let auth = authenticate(&state, &headers)?;
  let user = state.with_db(|c| users::find_by_id(c, &auth.id))?.ok_or_else(|| ApiError::Unauthorized("Usuário não encontrado".into()))?;
  Ok(Json(json!({ "user": public_user(&user) })))
}
