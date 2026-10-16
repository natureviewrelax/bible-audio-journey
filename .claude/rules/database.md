---
paths:
  - "crates/db/**"
  - "server/db/**"
---

# Regras de banco

- Migrations: `crates/db/migrations/NNN_nome.sql`, em ordem; nunca edite uma já aplicada, crie a próxima.
- Seeds idempotentes, com chave natural em `crates/db/seeds/index.json`. Não coloque senhas nem dados pessoais reais.
- Enquanto o backend Node existir, mantenha `server/db/{migrations,seeds}` idêntico a `crates/db/{migrations,seeds}`.
- Tabela nova exposta ao cliente exige `TableSpec` em `crates/core/src/tables.rs` e teste em `crates/db/src/query.rs`.
