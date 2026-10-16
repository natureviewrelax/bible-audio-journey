# Bible Audio Journey — Agent and Rust Conventions

Convenções adaptadas dos projetos Rust da organização [storytold](https://github.com/storytold) (`wordcraft`, `artcraft-services`):
camadas explícitas, zero pânico em código de produção, lints como gate e instruções para agentes versionadas no repositório.

## Layout

| Camada | Crate | Responsabilidade |
|---|---|---|
| L0 | `crates/core` (`bible-core`) | Config do ambiente, lista de permissão das tabelas, hash de senha (scrypt). Sem rede, sem banco |
| L1 | `crates/db` (`bible-db`) | SQLite: conexão, migrations, seeds, consultas genéricas, usuários. Não conhece HTTP |
| L2 | `crates/api` (`bible-api`) | Rotas axum (auth, `/api/db/:table`, upload, SPA estático). Não escreve SQL |
| App | `apps/bible-server` | Binário: `serve`, `migrate`, `seed`, `setup`, `status`, `reset` |

- Dependências só apontam para baixo (L2 → L1 → L0). Um crate nunca importa de uma camada acima.
- `src/` (React/Vite) é o frontend; o backend Node em `server/` é legado e será removido depois da paridade validada.
- O contrato HTTP é o que `src/integrations/api/client.ts` consome. Mudou rota ou formato → mude o cliente na mesma PR.

## Erros e prevenção de crash

Prevenção de crash vem antes de feature. Corrija um crash antes de construir em cima.

- **Sem pânico em código de produção.** Nada de `unwrap()`, `expect()`, `panic!`, `todo!`, `unimplemented!`, `unreachable!`. `unsafe` é proibido (`unsafe_code = "forbid"`).
  Cada crate raiz tem `#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic, clippy::unimplemented, clippy::todo, clippy::unreachable)]`; crates novos começam com o mesmo atributo. Testes podem usar `unwrap` (ver `clippy.toml`).
- **Retorne `Result`** com o erro do crate (`DbError`, `ApiError`, `PasswordError`) e propague com `?`. Funcionalidade inacabada retorna erro ou fica desligada.
- **Trate toda entrada como hostil** (corpo JSON, filtros, nomes de arquivo, hashes no banco): use `get()` em vez de `[i]`, aritmética checada, limites de tamanho, listas de permissão para colunas/tabelas, parâmetros SQL para valores.
- **Todo crash corrigido ganha teste de regressão.** Ver `hostile_input_is_rejected_not_panicking` (`crates/db/src/query.rs`) e `hostile_hashes_never_panic`.
- Mutex envenenado não derruba o servidor (`unwrap_or_else(|e| e.into_inner())`). Trabalho CPU-bound (scrypt) roda em `spawn_blocking`.

## Estilo e gate

- `rustfmt.toml`: `max_width = 150`, `use_small_heuristics = "Max"`, 2 espaços. Rode `cargo fmt --all`.
- O gate antes de qualquer commit:

```bash
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

- Sem JS/TS escrito à mão para o backend. Mensagens ao usuário e comentários em português, identificadores em inglês.
- Logs com `tracing`; filtro por `RUST_LOG` (ex.: `RUST_LOG=debug,tower_http=debug`).

## Banco de dados

- Migrations em `crates/db/migrations/NNN_nome.sql`, aplicadas em ordem e registradas em `schema_migrations`. **Nunca edite uma migration já aplicada**: crie a próxima.
- Seeds em `crates/db/seeds/` (`index.json` define tabela, arquivo e chave natural). São idempotentes e embutidos no binário (`include_dir`).
- Nova tabela exposta ao cliente → adicionar um `TableSpec` em `crates/core/src/tables.rs` (lista de colunas permitidas) e teste.
- Os arquivos em `crates/db/{migrations,seeds}` são cópias dos de `server/db/` enquanto os dois backends coexistirem; mantenha-os idênticos.

## Configuração (ambiente)

`API_PORT` (3001), `DB_FILE` (`server/data/bible.db`), `UPLOAD_DIR` (`server/uploads`), `DIST_DIR` (`dist`), `SEED_ON_START` (`true`), `JWT_SECRET` (gerado e salvo em `.jwt-secret` ao lado do banco), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
Os hashes de senha são compatíveis com os da API Node: usuários existentes continuam entrando.

## Comandos

```bash
cargo run -p bible-server                 # API em :3001
cargo run -p bible-server -- setup        # migrate + seed
cargo run -p bible-server -- status
CONFIRM_RESET=yes cargo run -p bible-server -- reset
```

## Commits e documentação

- Commits pequenos, depois de cada etapa que compila e passa no gate. Mensagem no imperativo, em português, como o histórico atual.
- Atualize `AGENTS.md`/README quando mudar camadas, variáveis de ambiente ou rotas.

## Trabalho paralelo

- Dê a cada agente paralelo o seu `CARGO_TARGET_DIR` e edite só os crates que ele possui; apague o diretório de build ao terminar.
- Agentes especializados ficam em `.claude/agents/`; regras curtas em `.claude/rules/`.
