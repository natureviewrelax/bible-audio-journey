//! Consultas genéricas do endpoint `/api/db/:table`. Colunas só entram no SQL depois de validadas
//! contra a lista de permissão da tabela; todo valor vai por parâmetro.
use bible_core::tables::{FilterOp, TableSpec};
use rusqlite::types::{Value as Sql, ValueRef};
use rusqlite::{params_from_iter, Connection};
use serde::Deserialize;
use serde_json::{Map, Value};

use crate::DbError;

pub type JsonRow = Map<String, Value>;

static NULL: Value = Value::Null;

#[derive(Debug, Clone, Copy, Default, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Op {
  #[default]
  Select,
  Insert,
  Upsert,
  Update,
  Delete,
}

/// Corpo: `{ op, filters: [[col, op, val]], values, order: [[col, asc]], limit }`.
#[derive(Debug, Default, Deserialize)]
#[serde(default)]
pub struct DataRequest {
  pub op: Op,
  pub filters: Vec<Vec<Value>>,
  pub values: Option<Value>,
  pub order: Vec<Vec<Value>>,
  pub limit: Option<u64>,
}

fn q(col: &str) -> String {
  format!("\"{col}\"")
}

fn check_col(spec: &TableSpec, col: &str) -> Result<(), DbError> {
  if spec.has_column(col) {
    Ok(())
  } else {
    Err(DbError::invalid(format!("Coluna inválida: {col}")))
  }
}

pub fn to_sql(v: &Value) -> Result<Sql, DbError> {
  Ok(match v {
    Value::Null => Sql::Null,
    Value::Bool(b) => Sql::Integer(i64::from(*b)),
    Value::Number(n) => match (n.as_i64(), n.as_f64()) {
      (Some(i), _) => Sql::Integer(i),
      (None, Some(f)) => Sql::Real(f),
      _ => return Err(DbError::invalid("Número inválido")),
    },
    Value::String(s) => Sql::Text(s.clone()),
    Value::Array(_) | Value::Object(_) => return Err(DbError::invalid("Valor inválido: objetos e listas não são suportados")),
  })
}

fn row_to_json(names: &[String], r: &rusqlite::Row<'_>) -> rusqlite::Result<JsonRow> {
  let mut out = JsonRow::new();
  for (i, name) in names.iter().enumerate() {
    let v = match r.get_ref(i)? {
      ValueRef::Null | ValueRef::Blob(_) => Value::Null,
      ValueRef::Integer(n) => Value::from(n),
      ValueRef::Real(f) => serde_json::Number::from_f64(f).map(Value::Number).unwrap_or(Value::Null),
      ValueRef::Text(t) => Value::String(String::from_utf8_lossy(t).into_owned()),
    };
    out.insert(name.clone(), v);
  }
  Ok(out)
}

fn select(conn: &Connection, spec: &TableSpec, where_sql: &str, params: &[Sql], tail: &str) -> Result<Vec<JsonRow>, DbError> {
  let mut stmt = conn.prepare(&format!("SELECT * FROM {}{where_sql}{tail}", q(spec.name)))?;
  let names: Vec<String> = stmt.column_names().into_iter().map(String::from).collect();
  let rows = stmt.query_map(params_from_iter(params.iter()), |r| row_to_json(&names, r))?.collect::<Result<Vec<_>, _>>()?;
  Ok(rows)
}

fn where_clause(spec: &TableSpec, filters: &[Vec<Value>]) -> Result<(String, Vec<Sql>), DbError> {
  let mut parts = Vec::new();
  let mut params = Vec::new();
  for f in filters {
    let col = f.first().and_then(Value::as_str).ok_or_else(|| DbError::invalid("Filtro inválido"))?;
    let op_name = f.get(1).and_then(Value::as_str).ok_or_else(|| DbError::invalid("Filtro inválido"))?;
    check_col(spec, col)?;
    let op = FilterOp::parse(op_name).ok_or_else(|| DbError::invalid(format!("Operador inválido: {op_name}")))?;
    let val = f.get(2).unwrap_or(&NULL);
    if op == FilterOp::Is || val.is_null() {
      parts.push(format!("{} {}", q(col), if op == FilterOp::Neq { "IS NOT NULL" } else { "IS NULL" }));
    } else {
      parts.push(format!("{} {} ?", q(col), op.sql()));
      params.push(to_sql(val)?);
    }
  }
  let sql = if parts.is_empty() { String::new() } else { format!(" WHERE {}", parts.join(" AND ")) };
  Ok((sql, params))
}

fn order_limit(spec: &TableSpec, order: &[Vec<Value>], limit: Option<u64>) -> Result<String, DbError> {
  let mut tail = String::new();
  if !order.is_empty() {
    let mut items = Vec::new();
    for o in order {
      let col = o.first().and_then(Value::as_str).ok_or_else(|| DbError::invalid("Ordenação inválida"))?;
      check_col(spec, col)?;
      let asc = o.get(1).and_then(Value::as_bool) != Some(false);
      items.push(format!("{} {}", q(col), if asc { "ASC" } else { "DESC" }));
    }
    tail.push_str(&format!(" ORDER BY {}", items.join(",")));
  }
  if let Some(n) = limit.filter(|n| *n > 0) {
    tail.push_str(&format!(" LIMIT {n}"));
  }
  Ok(tail)
}

fn object_columns(spec: &TableSpec, obj: &JsonRow) -> Result<(Vec<String>, Vec<Sql>), DbError> {
  let mut cols = Vec::new();
  let mut vals = Vec::new();
  for (k, v) in obj {
    check_col(spec, k)?;
    cols.push(k.clone());
    vals.push(to_sql(v)?);
  }
  Ok((cols, vals))
}

fn insert_one(conn: &Connection, spec: &TableSpec, obj: &JsonRow, upsert: bool) -> Result<Vec<JsonRow>, DbError> {
  let pk_given = matches!(obj.get(spec.pk), Some(Value::String(s)) if !s.is_empty());
  let mut clean = obj.clone();
  if !pk_given {
    clean.remove(spec.pk);
  }
  let (mut cols, mut vals) = object_columns(spec, &clean)?;
  let pk_value = if pk_given {
    obj.get(spec.pk).and_then(Value::as_str).unwrap_or_default().to_string()
  } else {
    let id = uuid::Uuid::new_v4().to_string();
    cols.push(spec.pk.to_string());
    vals.push(Sql::Text(id.clone()));
    id
  };

  // Upsert sem PK: usa a chave natural (ex.: livro/capítulo/versículo/autor), tratando ausente como NULL.
  let natural = upsert && !pk_given && !spec.conflict.is_empty();
  if natural {
    for c in spec.conflict {
      if !cols.iter().any(|x| x == c) {
        cols.push((*c).to_string());
        vals.push(Sql::Null);
      }
    }
  }
  let natural_params = || -> Vec<Sql> {
    spec.conflict.iter().map(|c| cols.iter().position(|x| x == c).and_then(|i| vals.get(i)).cloned().unwrap_or(Sql::Null)).collect()
  };

  let mut sql = format!(
    "INSERT INTO {} ({}) VALUES ({})",
    q(spec.name),
    cols.iter().map(|c| q(c)).collect::<Vec<_>>().join(","),
    vec!["?"; cols.len()].join(",")
  );
  if upsert {
    if natural {
      let params = natural_params();
      if params.iter().any(|p| matches!(p, Sql::Null)) {
        // UNIQUE com NULL não conflita no SQLite: remove a linha equivalente manualmente.
        let cond = spec.conflict.iter().map(|c| format!("{} IS ?", q(c))).collect::<Vec<_>>().join(" AND ");
        conn.execute(&format!("DELETE FROM {} WHERE {cond}", q(spec.name)), params_from_iter(params.iter()))?;
      }
    }
    let target: Vec<&str> = if natural { spec.conflict.to_vec() } else { vec![spec.pk] };
    let update: Vec<String> =
      cols.iter().filter(|c| c.as_str() != spec.pk && !target.contains(&c.as_str())).map(|c| format!("{0}=excluded.{0}", q(c))).collect();
    sql.push_str(&format!(" ON CONFLICT ({}) DO ", target.iter().map(|c| q(c)).collect::<Vec<_>>().join(",")));
    if update.is_empty() {
      sql.push_str("NOTHING");
    } else {
      sql.push_str(&format!("UPDATE SET {}", update.join(",")));
    }
  }
  conn.execute(&sql, params_from_iter(vals.iter()))?;

  if natural {
    let cond = spec.conflict.iter().map(|c| format!("{} IS ?", q(c))).collect::<Vec<_>>().join(" AND ");
    select(conn, spec, &format!(" WHERE {cond}"), &natural_params(), "")
  } else {
    select(conn, spec, &format!(" WHERE {} = ?", q(spec.pk)), &[Sql::Text(pk_value)], "")
  }
}

fn insert_many(conn: &Connection, spec: &TableSpec, values: Option<&Value>, upsert: bool) -> Result<Vec<JsonRow>, DbError> {
  let items: Vec<&Value> = match values {
    Some(Value::Array(a)) => a.iter().collect(),
    Some(v @ Value::Object(_)) => vec![v],
    _ => return Err(DbError::invalid("values ausente")),
  };
  let tx = conn.unchecked_transaction()?;
  let mut out = Vec::new();
  for item in items {
    let Value::Object(obj) = item else { return Err(DbError::invalid("Cada item de values deve ser um objeto")) };
    out.extend(insert_one(&tx, spec, obj, upsert)?);
  }
  tx.commit()?;
  Ok(out)
}

fn update(conn: &Connection, spec: &TableSpec, req: &DataRequest) -> Result<Vec<JsonRow>, DbError> {
  let Some(Value::Object(obj)) = &req.values else { return Err(DbError::invalid("values ausente")) };
  let (w_sql, w_params) = where_clause(spec, &req.filters)?;
  if w_sql.is_empty() {
    return Err(DbError::invalid("update exige ao menos um filtro"));
  }
  let (cols, vals) = object_columns(spec, obj)?;
  let mut sets: Vec<String> = cols.iter().map(|c| format!("{}=?", q(c))).collect();
  if spec.touch_updated_at && !cols.iter().any(|c| c == "updated_at") {
    sets.push(format!("{}=strftime('%Y-%m-%dT%H:%M:%fZ','now')", q("updated_at")));
  }
  if sets.is_empty() {
    return Ok(Vec::new());
  }
  let params: Vec<Sql> = vals.into_iter().chain(w_params.iter().cloned()).collect();
  conn.execute(&format!("UPDATE {} SET {}{w_sql}", q(spec.name), sets.join(",")), params_from_iter(params.iter()))?;
  select(conn, spec, &w_sql, &w_params, "")
}

pub fn execute(conn: &Connection, spec: &TableSpec, req: &DataRequest) -> Result<Vec<JsonRow>, DbError> {
  match req.op {
    Op::Select => {
      let (w_sql, w_params) = where_clause(spec, &req.filters)?;
      select(conn, spec, &w_sql, &w_params, &order_limit(spec, &req.order, req.limit)?)
    }
    Op::Insert => insert_many(conn, spec, req.values.as_ref(), false),
    Op::Upsert => insert_many(conn, spec, req.values.as_ref(), true),
    Op::Update => update(conn, spec, req),
    Op::Delete => {
      let (w_sql, w_params) = where_clause(spec, &req.filters)?;
      if w_sql.is_empty() {
        return Err(DbError::invalid("delete exige ao menos um filtro"));
      }
      conn.execute(&format!("DELETE FROM {}{w_sql}", q(spec.name)), params_from_iter(w_params.iter()))?;
      Ok(Vec::new())
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::migrate::migrate;
  use bible_core::tables::{BIBLE_VIDEOS, VERSE_AUDIO};
  use serde_json::json;

  fn db() -> Connection {
    let conn = Connection::open_in_memory().unwrap();
    migrate(&conn).unwrap();
    conn
  }

  fn req(v: Value) -> DataRequest {
    serde_json::from_value(v).unwrap()
  }

  #[test]
  fn insert_select_update_delete() {
    let conn = db();
    let rows = execute(&conn, &BIBLE_VIDEOS, &req(json!({"op":"insert","values":{"youtube_id":"abc","title":"t","description":"d"}}))).unwrap();
    let id = rows[0]["id"].as_str().unwrap().to_string();
    let upd = req(json!({"op":"update","filters":[["id","eq",id]],"values":{"title":"novo"}}));
    assert_eq!(execute(&conn, &BIBLE_VIDEOS, &upd).unwrap()[0]["title"], "novo");
    execute(&conn, &BIBLE_VIDEOS, &req(json!({"op":"delete","filters":[["id","eq",id]]}))).unwrap();
    assert!(execute(&conn, &BIBLE_VIDEOS, &req(json!({}))).unwrap().is_empty());
  }

  #[test]
  fn upsert_by_natural_key_with_null_author_replaces() {
    let conn = db();
    let row = |path: &str| json!({"op":"upsert","values":{"book":"Salmos","chapter":1,"verse":1,"audio_path":path}});
    execute(&conn, &VERSE_AUDIO, &req(row("a.mp3"))).unwrap();
    let out = execute(&conn, &VERSE_AUDIO, &req(row("b.mp3"))).unwrap();
    assert_eq!(out[0]["audio_path"], "b.mp3");
    assert_eq!(execute(&conn, &VERSE_AUDIO, &req(json!({}))).unwrap().len(), 1);
  }

  #[test]
  fn hostile_input_is_rejected_not_panicking() {
    let conn = db();
    for body in [
      json!({"filters":[["nope","eq",1]]}),
      json!({"filters":[["id","drop",1]]}),
      json!({"filters":[[]]}),
      json!({"filters":[[1,2,3]]}),
      json!({"order":[["x\"; DROP TABLE users;--"]]}),
      json!({"op":"insert"}),
      json!({"op":"insert","values":[1]}),
      json!({"op":"update","values":{"title":"x"}}),
      json!({"op":"delete"}),
      json!({"op":"insert","values":{"title":{"a":1}}}),
    ] {
      assert!(execute(&conn, &BIBLE_VIDEOS, &req(body)).is_err());
    }
  }
}
