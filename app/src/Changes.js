import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BOOKS, comparar } from './bible';
import { diffVerso } from './diff';
import { BRANCH_PADRAO, baixarVersao, commitsDoArquivo, listarBranches } from './history';
import Picker from './Picker';

// Revisão grafia: mostra, versículo a versículo, a diferença entre duas versões do arquivo JSON do texto,
// lidas do histórico do GitHub (por branch e commit). O diff é feito na hora; nada vem do texto embutido no app.
export default function Changes({ t, fontSize = 17, onClose }) {
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState(BRANCH_PADRAO);
  const [commits, setCommits] = useState([]);
  const [de, setDe] = useState(null);     // sha do commit de origem
  const [para, setPara] = useState(null); // sha do commit de destino
  const [all, setAll] = useState([]);
  const [estado, setEstado] = useState('carregando'); // carregando | ok | erro | semArquivo
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [rodada, setRodada] = useState(0); // força nova comparação mesmo quando De/Para não mudam
  const [etapa, setEtapa] = useState('');
  const [picker, setPicker] = useState(null); // 'branch' | 'de' | 'para' | 'livro'
  const [book, setBook] = useState('');
  const [query, setQuery] = useState('');

  // 1) branches do repositório (o padrão é a main).
  useEffect(() => {
    let vivo = true;
    setEtapa('Lendo os branches no GitHub…');
    listarBranches()
      .then(n => { if (vivo) setBranches(n.includes(BRANCH_PADRAO) ? n : [BRANCH_PADRAO, ...n]); })
      .catch(e => { if (vivo) { setErro(String(e.message ?? e)); setEstado('erro'); } });
    return () => { vivo = false; };
  }, [tentativa]);

  // 2) commits do arquivo no branch escolhido. Se a main ainda não tem o arquivo, usa o primeiro branch que tiver.
  useEffect(() => {
    if (!branches.length) return;
    let vivo = true;
    setEstado('carregando');
    setEtapa(`Lendo os commits do arquivo (${branch})…`);
    commitsDoArquivo(branch)
      .then(async lista => {
        if (!vivo) return;
        if (!lista.length) {
          const outro = branch === BRANCH_PADRAO ? await primeiroBranchComArquivo(branches, branch) : null;
          if (!vivo) return;
          if (outro) { setBranch(outro); return; }
          setCommits([]); setAll([]); setDe(null); setPara(null); setEstado('semArquivo'); return;
        }
        setCommits(lista);
        setDe(lista[lista.length - 1].sha); // original = commit mais antigo do arquivo
        setPara(lista[0].sha);              // atual = commit mais novo
        setRodada(r => r + 1);              // garante que a comparação rode de novo
      })
      .catch(e => { if (vivo) { setErro(String(e.message ?? e)); setEstado('erro'); } });
    return () => { vivo = false; };
  }, [branches, branch, tentativa]);

  // 3) baixa as duas versões do JSON e compara.
  useEffect(() => {
    if (!de || !para) return;
    let vivo = true;
    setEstado('carregando');
    setEtapa('Baixando as duas versões do texto e comparando…');
    Promise.all([baixarVersao(de), baixarVersao(para)])
      .then(([a, b]) => { if (vivo) { setAll(comparar(a, b)); setEstado('ok'); } })
      .catch(e => { if (vivo) { setErro(String(e.message ?? e)); setEstado('erro'); } });
    return () => { vivo = false; };
  }, [de, para, rodada, tentativa]);

  const counts = useMemo(() => {
    const c = {};
    all.forEach(x => { c[x.book] = (c[x.book] ?? 0) + 1; });
    return c;
  }, [all]);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(x => (!book || x.book === book) && (!q || x.antes.toLowerCase().includes(q) || x.depois.toLowerCase().includes(q)));
  }, [all, book, query]);

  const rotulo = sha => (sha ? sha.slice(0, 7) : '…');
  const itemCommit = c => ({ value: c.sha, label: `${c.sha.slice(0, 7)} · ${c.data} · ${c.msg}` });

  const size = Math.max(14, fontSize - 2);
  const Linha = ({ sinal, partes, forte }) => (
    <View style={s.linha}>
      <Text style={{ color: t.muted, width: 18, fontSize: size }}>{sinal}</Text>
      <Text style={{ flex: 1, color: forte ? t.text : t.muted, fontSize: size, lineHeight: Math.round(size * 1.5) }}>
        {partes.map((p, i) => (
          <Text key={i} style={p.mark ? [s.mark, { backgroundColor: t.hl }, forte ? s.depois : s.antes] : null}>{p.text}</Text>
        ))}
      </Text>
    </View>
  );

  const Item = ({ item }) => {
    const d = useMemo(() => diffVerso(item.antes, item.depois), [item]);
    return (
      <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={{ color: t.primary, fontWeight: '600', marginBottom: 4 }}>{item.book} {item.chapter}:{item.verse}</Text>
        <Linha sinal="−" partes={d.antes} />
        <Linha sinal="+" partes={d.depois} forte />
      </View>
    );
  };

  const Pill = ({ label, onPress, a11y, flex }) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={[s.pill, { backgroundColor: t.hl }, flex && { flex: 1 }]}>
      <Text numberOfLines={1} style={{ color: t.text, fontSize: 14, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );

  const aviso = estado === 'ok' ? null : estado;

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <View style={[s.bar, { borderColor: t.border }]}>
        <View style={s.head}>
          <Text style={[s.title, { color: t.text }]}>Revisão grafia</Text>
          <Pressable onPress={onClose} hitSlop={12}><Text style={{ color: t.primary, fontSize: 16 }}>Fechar</Text></Pressable>
        </View>
        <View style={s.row}>
          <Pill flex label={`Branch: ${branch}`} a11y="Escolher branch" onPress={() => setPicker('branch')} />
          <Pill flex label={`De: ${rotulo(de)}`} a11y="Versão de origem" onPress={() => setPicker('de')} />
          <Pill flex label={`Para: ${rotulo(para)}`} a11y="Versão de destino" onPress={() => setPicker('para')} />
        </View>
        <View style={s.row}>
          <Pill label={book || 'Todos os livros'} a11y={`Livro: ${book || 'todos'}`} onPress={() => setPicker('livro')} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Filtrar por palavra..."
            placeholderTextColor={t.muted}
            style={[s.input, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
          />
        </View>
      </View>

      {aviso ? (
        <View style={s.centro}>
          {aviso === 'carregando' && (
            <>
              <ActivityIndicator color={t.primary} />
              <Text style={[s.nota, { color: t.muted }]}>{etapa || 'Buscando o histórico e comparando…'}</Text>
            </>
          )}
          {aviso === 'semArquivo' && (
            <Text style={[s.nota, { color: t.muted }]}>O branch {branch} não tem commits deste arquivo. Escolha outro branch.</Text>
          )}
          {aviso === 'erro' && (
            <>
              <Text style={[s.nota, { color: t.text }]}>Não foi possível carregar a revisão.</Text>
              <Text style={[s.nota, { color: t.muted }]}>Ela precisa de internet para ler o histórico no GitHub. ({erro})</Text>
              <Pressable onPress={() => setTentativa(tentativa + 1)} style={[s.btn, { borderColor: t.border, backgroundColor: t.card }]}>
                <Text style={{ color: t.text, fontSize: 14 }}>Tentar novamente</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={x => `${x.book}-${x.chapter}-${x.verse}`}
          initialNumToRender={12}
          windowSize={7}
          contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 10 }}
          ListHeaderComponent={
            <Text style={[s.nota, { color: t.muted }]}>
              Mostra a grafia da versão de origem (−) e a da versão de destino (+). Só a grafia foi revista; o sentido do texto não muda.{'\n'}
              {data.length.toLocaleString('pt-BR')} versículo(s).
            </Text>
          }
          ListEmptyComponent={<Text style={[s.nota, { color: t.muted }]}>Nenhuma diferença encontrada.</Text>}
          renderItem={({ item }) => <Item item={item} />}
        />
      )}

      <Picker t={t} visible={picker === 'branch'} title="Branch" selected={branch} onClose={() => setPicker(null)}
        items={branches.map(b => ({ value: b, label: b }))}
        onSelect={v => { setPicker(null); setBook(''); setBranch(v); }} />
      <Picker t={t} visible={picker === 'de'} title="De (versão de origem)" selected={de} onClose={() => setPicker(null)}
        items={commits.map(itemCommit)} onSelect={v => { setPicker(null); setDe(v); }} />
      <Picker t={t} visible={picker === 'para'} title="Para (versão de destino)" selected={para} onClose={() => setPicker(null)}
        items={commits.map(itemCommit)} onSelect={v => { setPicker(null); setPara(v); }} />
      <Picker t={t} visible={picker === 'livro'} title="Livro" selected={book} onClose={() => setPicker(null)}
        items={[{ value: '', label: `Todos os livros (${all.length.toLocaleString('pt-BR')})` }, ...BOOKS.filter(b => counts[b.name]).map(b => ({ value: b.name, label: `${b.name} (${counts[b.name]})` }))]}
        onSelect={v => { setBook(v); setPicker(null); }} />
    </View>
  );
}

// Procura, entre os branches, o primeiro que tenha commits do arquivo (usado quando a main ainda não o tem).
async function primeiroBranchComArquivo(branches, ignorar) {
  for (const b of branches) {
    if (b === ignorar) continue;
    try { if ((await commitsDoArquivo(b)).length) return b; } catch { /* tenta o próximo */ }
  }
  return null;
}

const s = StyleSheet.create({
  root: { flex: 1 },
  bar: { paddingTop: 36, paddingHorizontal: 12, paddingBottom: 10, gap: 10, borderBottomWidth: 1 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  title: { fontSize: 20, fontWeight: '600', flex: 1, marginRight: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pill: { height: 40, borderRadius: 20, paddingHorizontal: 12, justifyContent: 'center', maxWidth: '60%' },
  // minWidth 0: na web o <input> tem largura mínima própria e empurraria os botões para fora da tela.
  input: { flex: 1, minWidth: 0, height: 40, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 4 },
  linha: { flexDirection: 'row' },
  mark: { borderRadius: 3 },
  antes: { textDecorationLine: 'line-through' },
  depois: { fontWeight: '700' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 10 },
  btn: { paddingHorizontal: 16, height: 40, borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  nota: { fontSize: 13, textAlign: 'center', marginBottom: 8 },
});
