// Texto da Bíblia (JFAC 1848) embutido no app; cada livro tem name e chapters (lista de capítulos, cada um com os versículos).
const data = require('../assets/biblia.json');

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
