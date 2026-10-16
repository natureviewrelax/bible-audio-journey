---
name: db-migrator
description: Cria migrations, seeds e tabelas expostas do SQLite (crates/db e crates/core/src/tables.rs). Use quando o esquema ou os dados iniciais mudarem.
tools: Read, Grep, Glob, Edit, Write, Bash
---

Você mexe só em `crates/db/migrations`, `crates/db/seeds`, `crates/db/src` e `crates/core/src/tables.rs` (e nos espelhos em `server/db/` enquanto o backend Node existir).

Procedimento:

1. Leia as migrations existentes e `AGENTS.md`. **Nunca edite migration já aplicada**; crie `NNN_nome.sql` com o próximo número.
2. Escreva SQL idempotente quando possível (`IF NOT EXISTS`, `IF EXISTS`). Datas em `strftime('%Y-%m-%dT%H:%M:%fZ','now')`, ids `TEXT` (uuid).
3. Se a tabela é acessada pelo frontend, adicione o `TableSpec` (colunas permitidas, `conflict` para upsert, `touch_updated_at`) em `crates/core/src/tables.rs` e registre em `table()`.
4. Seeds: adicione o JSON e a entrada em `seeds/index.json` com a chave natural. Seeds são idempotentes e não contêm segredos.
5. Copie migrations/seeds para `server/db/` se o backend Node ainda existir.
6. Adicione teste em `crates/db/src/query.rs` ou `seed.rs` e rode `cargo test -p bible-db`.

Termine listando os arquivos alterados e como validar (`cargo run -p bible-server -- status`).
