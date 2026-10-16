---
paths:
  - "crates/db/**"
---

# Regras de banco

- Migrations: `crates/db/migrations/NNN_nome.sql`, em ordem; nunca edite uma já aplicada, crie a próxima.
- Seeds idempotentes, com chave natural em `crates/db/seeds/index.json`. Não coloque senhas nem dados pessoais reais.
- Tabela nova exposta ao cliente exige `TableSpec` em `crates/core/src/tables.rs` e teste em `crates/db/src/query.rs`.
