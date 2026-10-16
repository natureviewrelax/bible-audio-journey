---
paths:
  - "crates/**/*.rs"
  - "apps/**/*.rs"
---

# Regras Rust

- Sem `unwrap`/`expect`/`panic!`/`todo!`/`unimplemented!`/`unreachable!` fora de testes; sem `unsafe`.
- Retorne `Result` com o erro do crate e use `?`. Entrada externa nunca indexa com `[i]`.
- Respeite as camadas: `api` → `db` → `core`. SQL só em `crates/db`; HTTP só em `crates/api`.
- Colunas e tabelas vindas do cliente passam pela lista de permissão de `crates/core/src/tables.rs`; valores sempre por parâmetro (`?`).
- Todo crash ou bug corrigido ganha teste de regressão no mesmo crate.
- Formatação: `cargo fmt --all` (2 espaços, largura 150). Lint: `cargo clippy --workspace --all-targets -- -D warnings`.
