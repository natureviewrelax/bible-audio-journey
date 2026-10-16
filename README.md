# Bíblia em Áudio JFAC 1848

Leitura da Bíblia (tradução João Ferreira de Almeida Corrigida, 1848) com áudio por versículo, vídeos e painel de administração.

- Frontend: Vite, TypeScript, React, shadcn-ui e Tailwind CSS (`src/`)
- Backend: Rust, axum e SQLite (`crates/`, `apps/`)
- Mobile: Capacitor (`android/`)

## Desenvolvimento

```sh
npm install
npm run dev:all   # API (cargo) na :3001 + Vite na :8080
```

## Gerar as versões mobile

```sh
npx cap add ios        # e/ou: npx cap add android
npm run build
npx cap sync
```

Depois abra o projeto no Android Studio ou Xcode. Sempre que alterar o código, rode `npm run build` e `npx cap sync`. As configurações do app (ID, nome, URL, splash) ficam em `capacitor.config.ts`.

## Banco de dados e API

O projeto usa uma API própria em Rust (axum + SQLite) no lugar do Supabase. Veja [AGENTS.md](AGENTS.md) para camadas e convenções.

- `npm run dev:all` sobe a API (porta 3001, `cargo run -p bible-server`) e o Vite (porta 8080, com proxy para `/api` e `/uploads`).
- Banco: `data/bible.db`. Áudios enviados: `uploads/`. Ambos ficam fora do git.
- Variáveis opcionais: `API_PORT`, `DB_FILE`, `UPLOAD_DIR`, `JWT_SECRET` (API) e `VITE_API_URL` (frontend, ex.: build Capacitor).
- Requer Rust (toolchain estável) e Node.

### Comandos de banco

Esquema em `crates/db/migrations/*.sql` e dados iniciais em `crates/db/seeds/` (JSON; veja o README da pasta). Ambos são embutidos no binário.

| Comando | O que faz |
|---|---|
| `cargo run -p bible-server -- migrate` | Aplica as migrations pendentes |
| `cargo run -p bible-server -- seed` | Aplica migrations e insere os dados iniciais que faltam (idempotente) |
| `npm run db:setup` | Migrations + seed |
| `npm run db:status` | Lista as migrations aplicadas |
| `CONFIRM_RESET=yes cargo run -p bible-server -- reset` | Apaga o banco e recria do zero |

## Backend em Rust

A API é em Rust (workspace na raiz); o contrato HTTP é o consumido por `src/integrations/api/client.ts`. Convenções e camadas em [AGENTS.md](AGENTS.md).

```sh
cargo run -p bible-server              # API em :3001 (banco em data/, uploads em uploads/)
cargo run -p bible-server -- setup     # migrations + seeds
cargo test --workspace
```
