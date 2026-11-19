// Texto da Bíblia (Almeida 1911) embutido no app; cada livro tem name e chapters (lista de capítulos, cada um com os versículos).
const data = require('../assets/porAlmeida1911.json');

export const BOOKS = data.map(b => ({ name: b.name, chapters: b.chapters.length }));

export function getChapter(book, chapter) {
  const b = data.find(x => x.name === book);
  return b?.chapters[chapter - 1]?.map((text, i) => ({ book, chapter, verse: i + 1, text })) ?? [];
}

export function searchVerses(query, limit = 100) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  for (const b of data) {
    for (let c = 0; c < b.chapters.length; c++) {
      b.chapters[c].forEach((text, v) => {
        if (out.length < limit && text.toLowerCase().includes(q)) out.push({ book: b.name, chapter: c + 1, verse: v + 1, text });
      });
    }
    if (out.length >= limit) break;
  }
  return out;
}

// Revisão grafia: compara, na hora, duas versões do JSON (listas de livros baixadas do histórico)
// e devolve os versículos que diferem.
export function comparar(antes, depois) {
  const out = [];
  depois.forEach(b => {
    const o = antes.find(x => x.name === b.name);
    if (!o) return;
    b.chapters.forEach((cap, c) => cap.forEach((txt, v) => {
      const velho = o.chapters[c]?.[v];
      if (velho !== undefined && velho !== txt) out.push({ book: b.name, chapter: c + 1, verse: v + 1, antes: velho, depois: txt });
    }));
  });
  return out;
}
