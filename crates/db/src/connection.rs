use std::fs;
use std::path::Path;

use rusqlite::Connection;

use crate::DbError;

pub fn open(file: &Path) -> Result<Connection, DbError> {
  if let Some(dir) = file.parent().filter(|d| !d.as_os_str().is_empty()) {
    fs::create_dir_all(dir)?;
  }
  let conn = Connection::open(file)?;
  conn.execute_batch("PRAGMA foreign_keys = ON;")?;
  Ok(conn)
}

/// Remove o arquivo do banco e seus auxiliares (`-wal`, `-shm`).
pub fn remove_files(file: &Path) -> Result<(), DbError> {
  for suffix in ["", "-wal", "-shm"] {
    let mut name = file.as_os_str().to_owned();
    name.push(suffix);
    match fs::remove_file(Path::new(&name)) {
      Ok(()) => {}
      Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
      Err(e) => return Err(e.into()),
    }
  }
  Ok(())
}
