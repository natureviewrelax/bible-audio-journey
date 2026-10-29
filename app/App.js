import { useEffect, useState } from 'react';
import { BackHandler, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reader from './src/Reader';
import { THEMES } from './src/theme';

const KEY = 'bibliaudio_app';

export default function App() {
  const [screen, setScreen] = useState('home'); // home | reader | about
  const [dark, setDark] = useState(false);
  const [pos, setPos] = useState({ book: 'Gênesis', chapter: 1, verse: 1 });
  const [ready, setReady] = useState(false);
  const t = THEMES[dark ? 'dark' : 'light'];

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => {
      if (v) { const o = JSON.parse(v); if (o.pos) setPos(o.pos); if (typeof o.dark === 'boolean') setDark(o.dark); }
    }).catch(() => {}).finally(() => setReady(true));
  }, []);

  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify({ dark, pos })).catch(() => {}); }, [dark, pos, ready]);

  // «Voltar» do Android: sai do leitor/Sobre para a tela inicial; na inicial, fecha o app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'home') return false;
      setScreen('home');
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {screen === 'reader' && <Reader t={t} dark={dark} onToggleTheme={() => setDark(!dark)} pos={pos} onPos={setPos} onMenu={() => setScreen('home')} />}
      {screen !== 'reader' && (
        <ScrollView contentContainerStyle={s.page}>
          <Text style={[s.title, { color: t.primary }]}>{screen === 'about' ? 'Sobre a Bíblia em Áudio JFAC 1848' : 'Bem-vindo à Bíblia em Áudio JFAC 1848'}</Text>
          {screen === 'home' ? (
            <>
              <Text style={[s.text, { color: t.muted }]}>Explore a Palavra de Deus através da histórica tradução João Ferreira de Almeida Corrigida de 1848.</Text>
              <Pressable style={[s.cta, { backgroundColor: t.primary }]} onPress={() => setScreen('reader')}>
                <Text style={{ color: t.onPrimary, fontSize: 17, fontWeight: '600' }}>Começar a Leitura</Text>
              </Pressable>
              <Pressable onPress={() => setScreen('about')}><Text style={{ color: t.primary, marginTop: 20, fontSize: 16 }}>Sobre</Text></Pressable>
              <Pressable onPress={() => setDark(!dark)}><Text style={{ color: t.muted, marginTop: 20, fontSize: 16 }}>{dark ? 'Tema claro' : 'Tema escuro'}</Text></Pressable>
            </>
          ) : (
            <>
              <Text style={[s.text, { color: t.muted }]}>A Bíblia em Áudio JFAC 1848 é um projeto dedicado a tornar a Palavra de Deus mais acessível, combinando a histórica tradução João Ferreira de Almeida Corrigida de 1848.</Text>
              <Text style={[s.text, { color: t.muted }]}>Nossa missão é proporcionar uma experiência única de estudo bíblico, permitindo que você acompanhe a leitura do texto enquanto ouve a narração.</Text>
              <Text style={[s.text, { color: t.muted }]}>Este projeto é uma iniciativa em parceria com <Text style={{ color: t.primary }} onPress={() => Linking.openURL('http://www.feedz360.com.br')}>Feedz360</Text>.</Text>
              <Pressable style={[s.cta, { backgroundColor: t.primary }]} onPress={() => setScreen('home')}>
                <Text style={{ color: t.onPrimary, fontSize: 17, fontWeight: '600' }}>Voltar para Início</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  text: { fontSize: 17, lineHeight: 26, textAlign: 'center', marginBottom: 16 },
  cta: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
});
