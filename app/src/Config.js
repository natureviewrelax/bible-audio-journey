import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export const FONT_MIN = 12;
export const FONT_MAX = 32;
export const FONT_DEFAULT = 17;

// Configurações do aplicativo: tema e tamanho da fonte do texto bíblico (salvos automaticamente).
export default function Config({ t, dark, onToggleTheme, fontSize, onFontSize, onClose }) {
  const set = n => onFontSize(Math.max(FONT_MIN, Math.min(FONT_MAX, n)));

  const Step = ({ label, onPress, disabled }) => (
    <Pressable onPress={onPress} disabled={disabled} style={[s.step, { borderColor: t.border, backgroundColor: t.card, opacity: disabled ? 0.4 : 1 }]}>
      <Text style={{ color: t.text, fontSize: 18 }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={s.page}>
      <View style={s.head}>
        <Text style={[s.title, { color: t.text }]}>Configurações do Aplicativo</Text>
        <Pressable onPress={onClose} hitSlop={12}><Text style={{ color: t.primary, fontSize: 16 }}>Fechar</Text></Pressable>
      </View>

      <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={s.row}>
          <Text style={[s.label, { color: t.text }]}>Tema do Aplicativo</Text>
          <View style={s.right}>
            <Text style={{ color: t.muted }}>{dark ? 'Escuro' : 'Claro'}</Text>
            <Switch
              value={dark}
              onValueChange={onToggleTheme}
              trackColor={{ true: t.primary, false: t.border }}
              thumbColor={dark ? t.onPrimary : '#FFFFFF'}
            />
          </View>
        </View>

        <View style={[s.row, s.sep, { borderColor: t.border }]}>
          <Text style={[s.label, { color: t.text }]}>Tamanho da fonte</Text>
          <View style={s.right}>
            <Step label="A−" onPress={() => set(fontSize - 1)} disabled={fontSize <= FONT_MIN} />
            <Text style={[s.value, { color: t.text }]}>{fontSize}</Text>
            <Step label="A+" onPress={() => set(fontSize + 1)} disabled={fontSize >= FONT_MAX} />
          </View>
        </View>

        <Text style={[s.preview, { color: t.text, fontSize, lineHeight: Math.round(fontSize * 1.5) }]}>
          No princípio, criou Deus os céus e a terra.
        </Text>

        <Pressable onPress={() => set(FONT_DEFAULT)}>
          <Text style={{ color: t.primary, textAlign: 'center', marginTop: 4 }}>Restaurar tamanho padrão</Text>
        </Pressable>
      </View>

      <Text style={[s.note, { color: t.muted }]}>Suas configurações são salvas automaticamente no aparelho.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 16, paddingTop: 48 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '600', flex: 1, marginRight: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sep: { borderTopWidth: 1, paddingTop: 14 },
  label: { fontSize: 16 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  step: { width: 44, height: 40, borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  value: { minWidth: 28, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  preview: { paddingVertical: 8 },
  note: { fontSize: 13, textAlign: 'center', marginTop: 12 },
});
