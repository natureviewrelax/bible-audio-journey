import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { BOOKS, getChapter, searchVerses } from './bible';
import Picker from './Picker';

// Agrupa versículos consecutivos: [1,2,3,5] → "1-3,5".
const ranges = nums => nums
  .reduce((acc, n, i) => {
    if (i && n === nums[i - 1] + 1) acc[acc.length - 1][1] = n;
    else acc.push([n, n]);
    return acc;
  }, [])
  .map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`))
  .join(',');

// Leitor: escolha de livro/capítulo/versículo, navegação entre capítulos, busca, alternância de tema
// e seleção de versículos (toque) para copiar ou compartilhar.
export default function Reader({ t, dark, fontSize = 17, onToggleTheme, pos, onPos, onMenu }) {
  const [picker, setPicker] = useState(null); // 'book' | 'chapter' | 'verse'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false); // busca aberta pela lupa: ocupa a linha toda
  const [sel, setSel] = useState([]); // versículos marcados no capítulo atual
  const [copied, setCopied] = useState(false);
  const list = useRef(null);

  const book = BOOKS.find(b => b.name === pos.book) ?? BOOKS[0];
  const verses = useMemo(() => getChapter(pos.book, pos.chapter), [pos.book, pos.chapter]);
  const seq = n => Array.from({ length: n }, (_, i) => ({ value: i + 1, label: String(i + 1) }));

  useEffect(() => {
    if (!results && verses.length) list.current?.scrollToIndex({ index: Math.min(pos.verse - 1, verses.length - 1), animated: true });
  }, [pos.verse, verses, results]);

  const clearSel = () => { setSel([]); setCopied(false); };
  const toggle = n => { setCopied(false); setSel(sel.includes(n) ? sel.filter(x => x !== n) : [...sel, n].sort((a, b) => a - b)); };
  const selText = () => {
    const picked = verses.filter(v => sel.includes(v.verse));
    const body = picked.length === 1 ? picked[0].text : picked.map(v => `${v.verse} ${v.text}`).join('\n');
    return `${body}\n\n${pos.book} ${pos.chapter}:${ranges(sel)} (JFAC 1848)`;
  };
  const copy = () => Clipboard.setStringAsync(selText()).then(() => setCopied(true)).catch(() => {});
  // Abre o menu de compartilhamento do sistema (WhatsApp, e-mail etc.).
  const share = () => Share.share({ message: selText() }).catch(() => {});

  const closeSearch = () => { setSearchOpen(false); setQuery(''); setResults(null); };
  const go = patch => { closeSearch(); clearSel(); onPos({ ...pos, verse: 1, ...patch }); };
  const prev = () => {
    if (pos.chapter > 1) go({ chapter: pos.chapter - 1 });
    else { const i = BOOKS.indexOf(book); if (i > 0) go({ book: BOOKS[i - 1].name, chapter: BOOKS[i - 1].chapters }); }
  };
  const next = () => {
    if (pos.chapter < book.chapters) go({ chapter: pos.chapter + 1 });
    else { const i = BOOKS.indexOf(book); if (i < BOOKS.length - 1) go({ book: BOOKS[i + 1].name, chapter: 1 }); }
  };
  const search = () => { clearSel(); setResults(query.trim() ? searchVerses(query) : null); };

  const Btn = ({ label, onPress, flex, w, a11y, children }) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={[s.btn, { borderColor: t.border, backgroundColor: t.card }, flex && { flex: 1 }, w && { width: w, paddingHorizontal: 0 }]}>
      {children ?? <Text numberOfLines={1} style={{ color: t.text, fontSize: 14 }}>{label}</Text>}
    </Pressable>
  );

  const Pill = ({ label, onPress, flex, a11y }) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={[s.pill, { backgroundColor: t.hl }, flex && { flex: 1 }]}>
      <Text numberOfLines={1} style={{ color: t.text, fontSize: 14, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
  const Icon = ({ onPress, a11y, children }) => (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={a11y} style={s.icon}>{children}</Pressable>
  );

  // Botões discretos nos cantos inferiores da leitura para trocar de capítulo.
  const Nav = ({ side, a11y, onPress }) => (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={a11y} style={[s.nav, { [side]: 14, backgroundColor: t.hl }]}>
      <View style={[s.chevron, side === 'left' ? s.chevronLeft : s.chevronRight, { borderColor: t.text }]} />
    </Pressable>
  );
  const bookIndex = BOOKS.indexOf(book);
  const hasPrev = pos.chapter > 1 || bookIndex > 0;
  const hasNext = pos.chapter < book.chapters || bookIndex < BOOKS.length - 1;

  const data = results ?? verses;
  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <View style={[s.bar, { borderColor: t.border }]}>
        <View style={s.row}>
          <Icon a11y="Pesquisar versículos" onPress={() => (searchOpen ? closeSearch() : setSearchOpen(true))}>
            <View style={s.lupa}>
              <View style={[s.lupaRing, { borderColor: t.text }]} />
              <View style={[s.lupaHandle, { backgroundColor: t.text }]} />
            </View>
          </Icon>
          <Pill flex label={pos.book} a11y={`Livro: ${pos.book}`} onPress={() => setPicker('book')} />
          <Pill label={String(pos.chapter)} a11y={`Capítulo ${pos.chapter}`} onPress={() => setPicker('chapter')} />
          <Pill label={`v. ${pos.verse}`} a11y={`Versículo ${pos.verse}`} onPress={() => setPicker('verse')} />
          <Icon a11y={dark ? 'Tema claro' : 'Tema escuro'} onPress={onToggleTheme}>
            <Text style={{ color: t.text, fontSize: 20 }}>{dark ? '☀︎' : '☾︎'}</Text>
          </Icon>
          <Icon a11y="Configurações" onPress={onMenu}>
            <View style={[s.more, { borderColor: t.text }]}>
              {[0, 1, 2].map(i => <View key={i} style={[s.dot, { backgroundColor: t.text }]} />)}
            </View>
          </Icon>
        </View>
        {searchOpen && (
          <View style={s.row}>
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={search}
              returnKeyType="search"
              placeholder="Pesquisar versículos..."
              placeholderTextColor={t.muted}
              style={[s.input, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
            />
            <Btn w={48} label="✕" a11y="Fechar busca" onPress={closeSearch} />
          </View>
        )}
      </View>

      <View style={s.root}>
        <FlatList
          ref={list}
          data={data}
          keyExtractor={v => `${v.book}-${v.chapter}-${v.verse}`}
          onScrollToIndexFailed={() => {}}
          contentContainerStyle={{ padding: 16, paddingBottom: 72 }}
          ListFooterComponent={<Text style={[s.version, { color: t.muted }]}>Tradução João Ferreira de Almeida Corrigida (JFAC 1848)</Text>}
          ListHeaderComponent={<Text style={[s.heading, { color: t.muted }]}>{results ? `${results.length} resultado(s)` : `${pos.book} ${pos.chapter}`}</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => (results ? go({ book: item.book, chapter: item.chapter, verse: item.verse }) : toggle(item.verse))}
              style={[
                s.verse,
                !results && item.verse === pos.verse && { backgroundColor: t.hl },
                !results && sel.includes(item.verse) && [s.selected, { backgroundColor: t.hl, borderLeftColor: t.primary }],
              ]}
            >
              {results && <Text style={{ color: t.primary, fontWeight: '600', marginBottom: 2 }}>{item.book} {item.chapter}:{item.verse}</Text>}
              <Text style={{ color: t.text, fontSize, lineHeight: Math.round(fontSize * 1.5) }}>
                {!results && <Text style={{ color: t.muted, fontSize: Math.max(11, Math.round(fontSize * 0.75)) }}>{item.verse}  </Text>}
                {item.text}
              </Text>
            </Pressable>
          )}
        />
        {!results && hasPrev && <Nav side="left" a11y="Capítulo anterior" onPress={prev} />}
        {!results && hasNext && <Nav side="right" a11y="Próximo capítulo" onPress={next} />}
      </View>

      {!results && sel.length > 0 && (
        <View style={[s.selBar, { borderColor: t.border, backgroundColor: t.card }]}>
          <Btn w={40} label="✕" onPress={clearSel} />
          <Text numberOfLines={1} style={{ flex: 1, color: t.text, fontSize: 14 }}>{sel.length} versículo{sel.length > 1 ? 's' : ''}</Text>
          <Btn label={copied ? 'Copiado ✓' : 'Copiar'} onPress={copy} />
          <Btn label="Compartilhar" onPress={share} />
        </View>
      )}

      <Picker t={t} visible={picker === 'book'} title="Livro" selected={pos.book} onClose={() => setPicker(null)}
        items={BOOKS.map(b => ({ value: b.name, label: b.name }))}
        onSelect={v => { setPicker(null); go({ book: v, chapter: 1 }); }} />
      <Picker t={t} visible={picker === 'chapter'} title="Capítulo" columns={5} selected={pos.chapter} onClose={() => setPicker(null)}
        items={seq(book.chapters)} onSelect={v => { setPicker(null); go({ chapter: v }); }} />
      <Picker t={t} visible={picker === 'verse'} title="Versículo" columns={5} selected={pos.verse} onClose={() => setPicker(null)}
        items={seq(verses.length)} onSelect={v => { setPicker(null); onPos({ ...pos, verse: v }); }} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  bar: { paddingTop: 36, paddingHorizontal: 12, paddingBottom: 8, gap: 8, borderBottomWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pill: { minWidth: 40, height: 40, borderRadius: 20, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center' },
  icon: { width: 32, height: 40, justifyContent: 'center', alignItems: 'center' },
  more: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2 },
  dot: { width: 3, height: 3, borderRadius: 2 },
  btn: { paddingHorizontal: 12, height: 40, borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  // minWidth 0: na web o <input> tem largura mínima própria e empurraria os botões para fora da tela.
  input: { flex: 1, minWidth: 0, height: 40, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
  selBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 16, borderTopWidth: 1 },
  selected: { borderLeftWidth: 3, paddingLeft: 5 },
  nav: { position: 'absolute', bottom: 14, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', opacity: 0.92 },
  chevron: { width: 12, height: 12, borderLeftWidth: 3, borderBottomWidth: 3 },
  chevronLeft: { marginLeft: 5, transform: [{ rotate: '45deg' }] },
  chevronRight: { marginRight: 5, transform: [{ rotate: '225deg' }] },
  lupa: { width: 18, height: 18 },
  lupaRing: { width: 13, height: 13, borderRadius: 7, borderWidth: 2 },
  lupaHandle: { position: 'absolute', left: 10, top: 13, width: 8, height: 2, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  heading: { fontSize: 14, marginBottom: 8 },
  version: { fontSize: 13, textAlign: 'center', marginTop: 16, marginBottom: 24 },
  verse: { paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8 },
});
