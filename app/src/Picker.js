import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

// Lista em tela cheia para escolher livro, capítulo ou versículo.
export default function Picker({ visible, title, items, selected, onSelect, onClose, t, columns = 1 }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[s.root, { backgroundColor: t.bg }]}>
        <View style={[s.head, { borderColor: t.border }]}>
          <Text style={[s.title, { color: t.text }]}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}><Text style={{ color: t.primary, fontSize: 16 }}>Fechar</Text></Pressable>
        </View>
        <FlatList
          key={columns}
          data={items}
          numColumns={columns}
          keyExtractor={i => String(i.value)}
          initialNumToRender={40}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item.value)}
              style={[s.item, columns > 1 && s.cell, { borderColor: t.border, backgroundColor: item.value === selected ? t.primary : t.card }]}
            >
              <Text style={{ color: item.value === selected ? t.onPrimary : t.text, fontSize: 16, textAlign: columns > 1 ? 'center' : 'left' }}>{item.label}</Text>
            </Pressable>
          )}
          contentContainerStyle={{ padding: 12 }}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 36 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '600' },
  item: { padding: 14, borderWidth: 1, borderRadius: 10, margin: 4 },
  cell: { flex: 1, minWidth: 60 },
});
