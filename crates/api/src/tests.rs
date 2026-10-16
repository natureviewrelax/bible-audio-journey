use axum::body::{to_bytes, Body};
use axum::http::{header, Method, Request, StatusCode};
use bible_core::config::Config;
use bible_db::{connection, migrate};
use serde_json::{json, Value};
use tower::ServiceExt;

use crate::{router, AppState};

fn app() -> axum::Router {
  let conn = connection::open(std::path::Path::new(":memory:")).unwrap();
  migrate::migrate(&conn).unwrap();
  let mut config = Config::from_env();
  config.upload_dir = std::env::temp_dir().join("bible-api-tests");
  config.dist_dir = "nao-existe".into();
  router(AppState::from_parts(conn, config, "segredo-de-teste"))
}

async fn call(app: &axum::Router, method: Method, uri: &str, token: Option<&str>, body: Value) -> (StatusCode, Value) {
  let mut req = Request::builder().method(method).uri(uri).header(header::CONTENT_TYPE, "application/json");
  if let Some(t) = token {
    req = req.header(header::AUTHORIZATION, format!("Bearer {t}"));
  }
  let res = app.clone().oneshot(req.body(Body::from(body.to_string())).unwrap()).await.unwrap();
  let status = res.status();
  let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
  (status, serde_json::from_slice(&bytes).unwrap_or(Value::Null))
}

#[tokio::test]
async fn signup_login_and_protected_writes() {
  let app = app();
  let creds = json!({"email":"Fulano@Teste.com","password":"123456"});

  let (s, body) = call(&app, Method::POST, "/api/auth/signup", None, creds.clone()).await;
  assert_eq!(s, StatusCode::OK);
  let token = body["token"].as_str().unwrap().to_string();
  assert_eq!(body["user"]["email"], "fulano@teste.com");

  assert_eq!(call(&app, Method::POST, "/api/auth/signup", None, creds.clone()).await.0, StatusCode::CONFLICT);
  assert_eq!(
    call(&app, Method::POST, "/api/auth/login", None, json!({"email":"fulano@teste.com","password":"errada"})).await.0,
    StatusCode::UNAUTHORIZED
  );
  assert_eq!(call(&app, Method::POST, "/api/auth/login", None, creds).await.0, StatusCode::OK);
  assert_eq!(call(&app, Method::GET, "/api/auth/me", Some(&token), Value::Null).await.0, StatusCode::OK);
  assert_eq!(call(&app, Method::GET, "/api/auth/me", None, Value::Null).await.0, StatusCode::UNAUTHORIZED);

  let write = json!({"op":"insert","values":{"youtube_id":"x","title":"t","description":"d"}});
  assert_eq!(call(&app, Method::POST, "/api/db/bible_videos", None, write.clone()).await.0, StatusCode::UNAUTHORIZED);
  assert_eq!(call(&app, Method::POST, "/api/db/bible_videos", Some(&token), write).await.0, StatusCode::OK);

  let (s, body) = call(&app, Method::POST, "/api/db/bible_videos", None, json!({"op":"select"})).await;
  assert_eq!((s, body["data"].as_array().map(Vec::len)), (StatusCode::OK, Some(1)));
}

#[tokio::test]
async fn unknown_table_and_route() {
  let app = app();
  assert_eq!(call(&app, Method::POST, "/api/db/users", None, json!({})).await.0, StatusCode::NOT_FOUND);
  assert_eq!(call(&app, Method::GET, "/api/nada", None, Value::Null).await.0, StatusCode::NOT_FOUND);
  assert_eq!(call(&app, Method::POST, "/api/db/bible_videos", None, Value::Null).await.0, StatusCode::BAD_REQUEST);
}
