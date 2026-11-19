// Diff palavra a palavra entre o texto de 1911 e o texto atual de um versículo.
const TOKEN = /[A-Za-zÀ-ÿ']+|[^A-Za-zÀ-ÿ']+/g;

// Devolve { antes, depois }: listas de trechos { text, mark }, com mark = true onde houve troca.
export function diffVerso(antes, depois) {
  const a = antes.match(TOKEN) ?? [];
  const b = depois.match(TOKEN) ?? [];
  const m = a.length;
  const n = b.length;
  const t = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);

  const out = { antes: [], depois: [] };
  const push = (list, text, mark) => {
    const last = list[list.length - 1];
    if (last && last.mark === mark) last.text += text;
    else list.push({ text, mark });
  };
  let i = 0;
  let j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) { push(out.antes, a[i], false); push(out.depois, b[j], false); i++; j++; }
    else if (j < n && (i === m || t[i][j + 1] >= t[i + 1][j])) { push(out.depois, b[j], true); j++; }
    else { push(out.antes, a[i], true); i++; }
  }
  return out;
}
