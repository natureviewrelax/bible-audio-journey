# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7db395c8-4e8b-4852-896c-62249d2d4f66

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7db395c8-4e8b-4852-896c-62249d2d4f66) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7db395c8-4e8b-4852-896c-62249d2d4f66) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)


## Para gerar as versões mobile do seu aplicativo, siga estas etapas:

**Exporte o projeto para o GitHub:**

Clique no botão "Exportar para GitHub" no topo da interface do Lovable
Siga as instruções para completar a exportação
Clone o projeto para o seu computador:


git clone [URL-DO-SEU-REPOSITÓRIO]
cd [NOME-DO-PROJETO]
Instale as dependências:


npm install
Adicione as plataformas iOS e/ou Android:


npx cap add ios
npx cap add android
Construa o projeto:


npm run build
Sincronize o projeto com as plataformas nativas:


npx cap sync
Execute o aplicativo:

Para Android (requer Android Studio):

npx cap open android
Para iOS (requer Mac com Xcode):

npx cap open ios
Importante:

Para iOS, você precisa de um Mac com Xcode instalado
Para Android, você precisa do Android Studio instalado
Sempre que fizer alterações no código, execute npm run build seguido de npx cap sync para atualizar as versões nativas
O arquivo capacitor.config.ts que configurei inclui:

ID e nome do aplicativo
URL para desenvolvimento hot-reload
Configurações da tela de splash
Após abrir o projeto no Android Studio ou Xcode, você poderá compilar e executar o aplicativo em um emulador ou dispositivo físico.

## Banco de dados e API

O projeto usa uma API própria (Node + SQLite, em `server/`) no lugar do Supabase.

- `npm run dev:all` sobe a API (porta 3001) e o Vite (porta 8080, com proxy para `/api` e `/uploads`).
- Banco: `server/data/bible.db`. Áudios enviados: `server/uploads/`. Ambos ficam fora do git.
- Variáveis opcionais: `API_PORT`, `DB_FILE`, `UPLOAD_DIR`, `JWT_SECRET` (API) e `VITE_API_URL` (frontend, ex.: build Capacitor).
- Requer Node 22.5+ (usa `node:sqlite`).

### Scripts de banco

A estrutura fica em `server/`: `config.js` (variáveis), `db/connection.js`, `db/migrations/*.sql` (esquema versionado), `db/seeds/` (dados iniciais em JSON, veja o README da pasta) e `scripts/db.js`.

| Comando | O que faz |
|---|---|
| `npm run db:migrate` | Aplica as migrations pendentes |
| `npm run db:seed` | Aplica migrations e insere os dados iniciais que faltam (idempotente) |
| `npm run db:setup` | Migrations + seed |
| `npm run db:status` | Lista as migrations aplicadas |
| `CONFIRM_RESET=yes npm run db:reset` | Apaga o banco e recria do zero |

Ao subir, a API roda migrations e seed sozinha (`SEED_ON_START=false` desliga o seed). `ADMIN_EMAIL`/`ADMIN_PASSWORD` definem o administrador inicial; sem senha, uma é gerada e mostrada no log. Para mudar o esquema, crie uma nova migration numerada, como `003_nome.sql`.

## Backend em Rust

A API também existe em Rust (workspace na raiz), com o mesmo contrato HTTP da API Node em `server/`. Convenções e camadas em [AGENTS.md](AGENTS.md).

```sh
cargo run -p bible-server              # API em :3001 (mesmos DB_FILE/UPLOAD_DIR/API_PORT da API Node)
cargo run -p bible-server -- setup     # migrations + seeds
cargo test --workspace
```
