import { useEffect, useState } from 'react';
import { BackHandler, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reader from './src/Reader';
import Config, { FONT_DEFAULT } from './src/Config';
import { THEMES } from './src/theme';

const KEY = 'bibliaudio_app';

export default function App() {
  const [screen, setScreen] = useState('reader'); // reader | config | about
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState(FONT_DEFAULT);
  const [pos, setPos] = useState({ book: 'Gênesis', chapter: 1, verse: 1 });
  const [ready, setReady] = useState(false);
  const t = THEMES[dark ? 'dark' : 'light'];

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => {
      if (v) { const o = JSON.parse(v); if (o.pos) setPos(o.pos); if (typeof o.dark === 'boolean') setDark(o.dark); if (typeof o.fontSize === 'number') setFontSize(o.fontSize); }
    }).catch(() => {}).finally(() => setReady(true));
  }, []);

  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify({ dark, pos, fontSize })).catch(() => {}); }, [dark, pos, fontSize, ready]);

  // «Voltar» do Android: Sobre → Configurações → leitor; no leitor, fecha o app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'reader') return false;
      setScreen(screen === 'about' ? 'config' : 'reader');
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {screen === 'reader' && <Reader t={t} dark={dark} fontSize={fontSize} onToggleTheme={() => setDark(!dark)} pos={pos} onPos={setPos} onMenu={() => setScreen('config')} />}
      {screen === 'config' && <Config t={t} dark={dark} onToggleTheme={() => setDark(!dark)} fontSize={fontSize} onFontSize={setFontSize} onAbout={() => setScreen('about')} onClose={() => setScreen('reader')} />}
      {screen === 'about' && (
        <ScrollView contentContainerStyle={s.page}>
          <Text style={[s.title, { color: t.primary }]}>Sobre a Bíblia Almeida 1911</Text>
          <Text style={[s.text, { color: t.muted }]}>A Bíblia Almeida 1911 é um projeto dedicado a tornar a Palavra de Deus mais acessível, combinando a histórica tradução João Ferreira de Almeida, edição de 1911.</Text>
          <Text style={[s.text, { color: t.muted }]}>Nossa missão é proporcionar uma experiência única de estudo bíblico, permitindo que você acompanhe a leitura.</Text>
          <Text style={[s.text, { color: t.muted }]}>Desenvolvido e mantido por <Text style={{ color: t.primary }} onPress={() => Linking.openURL('https://github.com/wendercorrea/theBible')}>theBible</Text>.</Text>
          <Text style={[s.text, { color: t.muted, fontSize: 14, lineHeight: 21 }]}>Texto: <Text style={{ color: t.primary }} onPress={() => Linking.openURL('https://crosswire.org/sword/modules/ModInfo.jsp?modName=PorAlmeida1911')}>crosswire.org/sword/modules/ModInfo.jsp?modName=PorAlmeida1911</Text></Text>
          <Pressable style={[s.cta, { backgroundColor: t.primary }]} onPress={() => setScreen('config')}>
            <Text style={{ color: t.onPrimary, fontSize: 17, fontWeight: '600' }}>Voltar</Text>
          </Pressable>
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
