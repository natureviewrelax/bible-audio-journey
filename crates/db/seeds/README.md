# Seeds (dados iniciais)

- `index.json` lista, em ordem, as tabelas a popular: `table`, `file` e `key`
  (colunas que identificam o registro; se já existir, é ignorado, então rodar de novo é seguro).
- Cada arquivo é um array JSON de linhas com os nomes das colunas da tabela.
  O `id` é gerado automaticamente quando não informado.
- Exemplo (`bible_videos.json`):
  `[{ "youtube_id": "dQw4w9WgXcQ", "title": "Título", "description": "Descrição" }]`
- O usuário administrador vem de `ADMIN_EMAIL` / `ADMIN_PASSWORD`
  (sem senha, uma é gerada e mostrada no log na primeira execução).
