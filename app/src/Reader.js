import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BOOKS, getChapter, searchVerses } from './bible';
import Picker from './Picker';

// Leitor: escolha de livro/capítulo/versículo, navegação entre capítulos, busca e alternância de tema.
export default function Reader({ t, dark, onToggleTheme, pos, onPos, onMenu }) {
  const [picker, setPicker] = useState(null); // 'book' | 'chapter' | 'verse'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const list = useRef(null);

  const book = BOOKS.find(b => b.name === pos.book) ?? BOOKS[0];
  const verses = useMemo(() => getChapter(pos.book, pos.chapter), [pos.book, pos.chapter]);
  const seq = n => Array.from({ length: n }, (_, i) => ({ value: i + 1, label: String(i + 1) }));

  useEffect(() => {
    if (!results && verses.length) list.current?.scrollToIndex({ index: Math.min(pos.verse - 1, verses.length - 1), animated: true });
  }, [pos.verse, verses, results]);

  const go = patch => { setResults(null); onPos({ ...pos, verse: 1, ...patch }); };
  const prev = () => {
    if (pos.chapter > 1) go({ chapter: pos.chapter - 1 });
    else { const i = BOOKS.indexOf(book); if (i > 0) go({ book: BOOKS[i - 1].name, chapter: BOOKS[i - 1].chapters }); }
  };
  const next = () => {
    if (pos.chapter < book.chapters) go({ chapter: pos.chapter + 1 });
    else { const i = BOOKS.indexOf(book); if (i < BOOKS.length - 1) go({ book: BOOKS[i + 1].name, chapter: 1 }); }
  };
  const search = () => setResults(query.trim() ? searchVerses(query) : null);

  const Btn = ({ label, onPress, flex }) => (
    <Pressable onPress={onPress} style={[s.btn, { borderColor: t.border, backgroundColor: t.card }, flex && { flex: 1 }]}>
      <Text numberOfLines={1} style={{ color: t.text, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );

  const data = results ?? verses;
  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <View style={[s.bar, { borderColor: t.border }]}>
        <View style={s.row}>
          <Pressable onPress={onMenu} hitSlop={10}><Text style={{ color: t.text, fontSize: 24 }}>≡</Text></Pressable>
          <Btn flex label={`${pos.book} ${pos.chapter}`} onPress={() => setPicker('book')} />
          <Btn label={`Cap. ${pos.chapter}`} onPress={() => setPicker('chapter')} />
          <Btn label={`Vers. ${pos.verse}`} onPress={() => setPicker('verse')} />
        </View>
        <View style={s.row}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
            placeholder="Pesquisar versículos..."
            placeholderTextColor={t.muted}
            style={[s.input, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
          />
          <Btn label="‹" onPress={prev} />
          <Btn label="›" onPress={next} />
          <Btn label={dark ? '☀' : '☾'} onPress={onToggleTheme} />
        </View>
      </View>

      <FlatList
        ref={list}
        data={data}
        keyExtractor={v => `${v.book}-${v.chapter}-${v.verse}`}
        onScrollToIndexFailed={() => {}}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={<Text style={[s.heading, { color: t.muted }]}>{results ? `${results.length} resultado(s)` : `${pos.book} ${pos.chapter}`}</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => (results ? go({ book: item.book, chapter: item.chapter, verse: item.verse }) : onPos({ ...pos, verse: item.verse }))}
            style={[s.verse, !results && item.verse === pos.verse && { backgroundColor: t.hl }]}
          >
            {results && <Text style={{ color: t.primary, fontWeight: '600', marginBottom: 2 }}>{item.book} {item.chapter}:{item.verse}</Text>}
            <Text style={{ color: t.text, fontSize: 17, lineHeight: 26 }}>
              {!results && <Text style={{ color: t.muted, fontSize: 13 }}>{item.verse}  </Text>}
              {item.text}
            </Text>
          </Pressable>
        )}
      />

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
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { paddingHorizontal: 12, height: 40, borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, height: 40, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
  heading: { fontSize: 14, marginBottom: 8 },
  verse: { paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8 },
});
