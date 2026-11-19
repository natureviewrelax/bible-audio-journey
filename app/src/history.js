// Histórico do texto no GitHub: branches, commits do arquivo e o texto de cada versão (sem hashes fixos).
const REPO = 'wendercorrea/TheBible';
const PATH = 'PorAlmeida1911.json';
export const BRANCH_PADRAO = 'main';

const api = async url => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GitHub respondeu ${r.status}`);
  return r.json();
};

export async function listarBranches() {
  const lista = await api(`https://api.github.com/repos/${REPO}/branches?per_page=100`);
  return lista.map(b => b.name);
}

// Commits que alteraram o arquivo no branch, do mais novo ao mais antigo (pagina a API).
export async function commitsDoArquivo(branch) {
  let all = [];
  for (let page = 1; page <= 20; page++) {
    const part = await api(`https://api.github.com/repos/${REPO}/commits?sha=${encodeURIComponent(branch)}&path=${PATH}&per_page=100&page=${page}`);
    all = all.concat(part);
    if (part.length < 100) break;
  }
  return all.map(c => ({ sha: c.sha, data: c.commit.author.date.slice(0, 10), msg: c.commit.message.split('\n')[0] }));
}

const cache = new Map();
// Texto da Bíblia (lista de livros) na versão do commit; guardado em memória enquanto o app está aberto.
export async function baixarVersao(sha) {
  if (cache.has(sha)) return cache.get(sha);
  const texto = await api(`https://raw.githubusercontent.com/${REPO}/${sha}/${PATH}`);
  cache.set(sha, texto);
  return texto;
}
