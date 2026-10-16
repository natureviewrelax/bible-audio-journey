@AGENTS.md

# Notas para o Claude Code

- Backend em Rust no workspace da raiz (`Cargo.toml`); frontend React em `src/`. Leia `AGENTS.md` antes de editar Rust.
- Regras por tema: `.claude/rules/`. Agentes: `rust-reviewer` (revisão de segurança/pânico/camadas) e `db-migrator` (migrations, seeds, tabelas expostas).
- Antes de dizer que terminou: `cargo fmt --all --check && cargo clippy --workspace --all-targets -- -D warnings && cargo test --workspace`.
