//! L0: sem I/O de rede nem de banco. Só configuração, esquema das tabelas expostas e senhas.
#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic, clippy::unimplemented, clippy::todo, clippy::unreachable)]

pub mod config;
pub mod password;
pub mod tables;
