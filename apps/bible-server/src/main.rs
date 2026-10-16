#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic, clippy::unimplemented, clippy::todo, clippy::unreachable)]

use anyhow::{bail, Result};
use bible_api::AppState;
use bible_core::config::Config;
use bible_db::{connection, migrate, seed};
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "bible-server", about = "API do Bible Audio Journey")]
struct Cli {
  #[command(subcommand)]
  command: Option<Command>,
}

#[derive(Subcommand)]
enum Command {
  /// Sobe a API (padrão)
  Serve,
  /// Aplica as migrations pendentes
  Migrate,
  /// Aplica migrations e popula os dados iniciais
  Seed,
  /// Igual a `seed`: garante esquema e dados
  Setup,
  /// Lista migrations aplicadas e pendentes
  Status,
  /// APAGA o banco e recria (exige CONFIRM_RESET=yes)
  Reset,
}

#[tokio::main]
async fn main() -> Result<()> {
  tracing_subscriber::fmt()
    .with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info,tower_http=info".into()))
    .with_target(false)
    .init();

  let config = Config::from_env();
  match Cli::parse().command.unwrap_or(Command::Serve) {
    Command::Serve => bible_api::serve(AppState::new(config)?).await?,
    Command::Migrate => {
      migrate::migrate(&connection::open(&config.db_file)?)?;
    }
    Command::Seed | Command::Setup => {
      let conn = connection::open(&config.db_file)?;
      migrate::migrate(&conn)?;
      seed::seed(&conn, &config)?;
    }
    Command::Status => {
      for (name, applied) in migrate::status(&connection::open(&config.db_file)?)? {
        println!("{} {name}", if applied { "[x]" } else { "[ ]" });
      }
    }
    Command::Reset => {
      if std::env::var("CONFIRM_RESET").as_deref() != Ok("yes") {
        bail!("reset APAGA o banco {}. Rode com CONFIRM_RESET=yes para confirmar.", config.db_file.display());
      }
      connection::remove_files(&config.db_file)?;
      let conn = connection::open(&config.db_file)?;
      migrate::migrate(&conn)?;
      seed::seed(&conn, &config)?;
    }
  }
  Ok(())
}
