//! L1: acesso ao SQLite. Não conhece HTTP.
#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic, clippy::unimplemented, clippy::todo, clippy::unreachable)]

pub mod connection;
pub mod error;
pub mod migrate;
pub mod query;
pub mod seed;
pub mod users;

pub use error::DbError;
pub use rusqlite::Connection;
